const path = require("path");
const dotenv = require('dotenv');
const Eos = require('eosjs');

exports.send = function(fromAcct, toAcct, message, amount = 0.0001){

	let keys = this.keys;
	let network = this.network;
	let crypto = require("./crypto.js")

	crypto.encrypt = crypto.encrypt.bind({keys:keys, network:network});
	crypto.decrypt = crypto.decrypt.bind({keys:keys, network:network});

	return new Promise(function(resolve, reject){

		let key = keys.find(function(k){return k.account == fromAcct});
		
		if (!key) return reject(`Couldn't find key for account ${fromAcct}`);

		network.keyProvider = key.priv_key

		const eos = Eos(network);

		crypto.encrypt(fromAcct, toAcct, message)
			.then(result=>{
				
				console.log("encrypted message:");
				console.log(result);

				eos.transfer({from: fromAcct, to: toAcct, quantity: `${amount} EOS`, memo: result})
					.then(transferResult=>{
						return resolve(transferResult);
					})
					.catch(err=>{
						return reject("error while transfering :" + err);
					});

			})
			.catch(err=>{
				return reject("error while encrypting message :" + err);
			});

	})
}


exports.scanForMessages = function(block_num_or_id, minAmount = 0.0001){

	let keys = this.keys;
	let network = this.network;
	let crypto = require("./crypto.js")

	crypto.encrypt = crypto.encrypt.bind({keys:keys, network:network});
	crypto.decrypt = crypto.decrypt.bind({keys:keys, network:network});

	return new Promise(function(resolve, reject){

		const eos = Eos(network);

		eos.getBlock(block_num_or_id)
			.then(block=>{

				var promises = [];
				var meta = [];

				for (var t of block.transactions){

					if (t.trx && t.trx.transaction && t.trx.transaction.actions && t.trx.transaction.actions.length>0){
						for (var a of t.trx.transaction.actions){

							if (a.name == "transfer"){

								var found = keys.find(function(k){return k.account == a.data.to});
								var qty = parseFloat(a.data.quantity.replace("EOS", "")); //spam filter

								if (found && qty>= minAmount && a.data.memo.indexOf("TO DECRYPT: msg.eostitan.com") != -1){

									meta.push({from:a.data.from, to:a.data.to});
									promises.push(crypto.decrypt(a.data.from, a.data.to, a.data.memo));

								}

							}
						}
					}
				}

				Promise.all(promises)
					.then(results=>{

						for (var i=0;i<meta.length;i++) meta[i].message = results[i];
						return resolve(meta);
					})
					.catch(err=>{
						return reject("error while scanning for messages:" + err);
					});
					

			})
			.catch(err=>{
				return reject("error while fetching block:" + err);
			});

	})
}