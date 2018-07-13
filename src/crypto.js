const path = require("path");
const dotenv = require('dotenv');
const Eos = require('eosjs');
const eosecc = require("eosjs-ecc");
const Long = require("long");
const colors = require("colors");

function serialize(buff){

	var str = "TO DECRYPT: msg.eostitan.com\n";

	str += buff.nonce.low.toString().padStart(11, ".");
	str += buff.nonce.high.toString().padStart(11, ".");
	str += buff.checksum.toString().padStart(11, ".");
	str += buff.message.toString('base64');

	return str;

}

function deserialize(message){
		
		message = message.replace("TO DECRYPT: msg.eostitan.com\n", "");

		var low = parseInt(message.substring(0, 11).replace(/[.]/g, ""));
		var high = parseInt(message.substring(11, 22).replace(/[.]/g, ""));
		var checksum = parseInt(message.substring(22, 33).replace(/[.]/g, ""));
		var message = message.substring(33, message.length);

		var obj = {
			nonce: new Long(low, high, 0),
			checksum: checksum,
			content: Buffer.from(message, "base64")
		}

		return obj;

}

exports.encrypt = function(fromAcct, toAcct, message){
	let keys = this.keys;
	let network = this.network;
	return new Promise(function(resolve, reject){

		let key = keys.find(function(k){return k.account == fromAcct});
		
		if (!key) return reject(`Couldn't find key for account ${fromAcct}`);

		const eos = Eos(network);

		eos.getAccount(toAcct)
			.then(acct=>{

				let perm = acct.permissions.find(function(p){return p.perm_name=="active"});

				if (!perm) return reject(`Couldn't find active permission for account ${toAcct}`);
				if (perm.required_auth.threshold !=1) return reject(`Sending to multi-sig addresses is not currently supported.`);

				let pubKey = perm.required_auth.keys[0].key;

				let buff = eosecc.Aes.encrypt(key.priv_key, pubKey, message);

				var str = serialize(buff);

				if (str.length>256) return reject("error: message too long (max 256 chars)");

				return resolve(str);

			}) 
			.catch(err=>{
				console.log("got eosjs error:".red, err);
				return reject(`Couldn't obtain account information for account ${toAcct}`) ;
			});

	});
}

exports.decrypt = function(fromAcct, toAcct, message){
	let keys = this.keys;
	let network = this.network;
	return new Promise(function(resolve, reject){

		let key = keys.find(function(k){return k.account == toAcct});
			
		if (!key) return reject(`Couldn't find key for account ${toAcct}`);

		const eos = Eos(network);
		
		eos.getAccount(fromAcct)
			.then(acct=>{

				let perm = acct.permissions.find(function(p){return p.perm_name=="active"});

				if (!perm) return reject(`Couldn't find active permission for account ${fromAcct}`);
				if (perm.required_auth.threshold !=1) return reject(`Receiving from multi-sig addresses is not currently supported.`);

				let pubKey = perm.required_auth.keys[0].key;

				var deserialized = deserialize(message);

				let decrypted = eosecc.Aes.decrypt(key.priv_key, pubKey, deserialized.nonce, deserialized.content, deserialized.checksum);

				return resolve(decrypted.toString('utf8'));

			}) 
			.catch(err=>{
				console.log("got eosjs error:".red, err);
				return reject(`Error decrypting message from ${fromAcct}`) ;
			});

	});
}
