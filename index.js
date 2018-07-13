var dotenv = require("dotenv");
var path = require("path");
var fs = require('fs');

function eosCommunications(opts){

	if (!opts) opts = {};

	if (!opts.keys) {
		var keyRingPath = path.join(__dirname, "keyRing.js");
		
		if (!fs.existsSync(keyRingPath)) throw "Must supply keys or use keyRing.js";
		
		opts.keys = require(keyRingPath).keys;

		if (!opts.keys || opts.keys.length<1) throw "Must supply keys or use keyRing.js";
		
	}

	if (!opts.network) {

		dotenv.load();

		if (!process.env.EOS_PROTOCOL || !process.env.EOS_HOST || !process.env.EOS_PORT || !process.env.EOS_CHAIN)
			throw "Must supply network information or use .env file";

		opts.network = {
		  httpEndpoint: process.env.EOS_PROTOCOL + "://" +  process.env.EOS_HOST + ":" + process.env.EOS_PORT,
		  chainId: process.env.EOS_CHAIN
		}

	}

	var comms = require(path.join(__dirname, "src", "communications.js"));
	var crypto = require(path.join(__dirname, "src", "crypto.js"));

	var self = this;

	self.send = comms.send.bind(opts);
	self.scanForMessages = comms.scanForMessages.bind(opts);
	self.encrypt = crypto.encrypt.bind(opts);
	self.decrypt = crypto.decrypt.bind(opts)

	return self;

}

module.exports = eosCommunications
