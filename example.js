var eosCommunications = require("./index.js");

//Configuration options, if omitted will default to keyRing.js and .env files
var opts = {
	network:{
 		httpEndpoint: "http://api.eostitan.com",
	  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
	},
	keys:[
		{
			"account":  "myeosaccount", 
			"priv_key": "5.....", 
			"pub_key":  "EOS...."
		}
	]
}

var eosCom = new eosCommunications(opts);

//Testing encryption / decryption functions without sending to the blockchain. Require private / public keys to both accounts
eosCom.encrypt("myeosaccount", "youraccount1", "Hello from EOS Titan!")
	.then(encrypted=>{
		console.log(encrypted);

		eosCom.decrypt("myeosaccount", "youraccount1", encrypted)
			.then(decrypted=>{
				console.log(decrypted);
			})
			.catch(err=>{
				console.log("error:", err);
			})

	})
	.catch(err=>{
		console.log("error:", err);
	})	


//Encrypt and send message to the blockchain
eosCom.send("myeosaccount", "youraccount1", "Hello from EOS Titan!")
	.then(result=>{
		console.log(result);
	})
	.catch(err=>{
		console.log("error:", err);
	});


//Scan a block for messages
eosCom.scanForMessages(5694692)
	.then(result=>{
		
		console.log(result);
	})
	.catch(err=>{
		console.log("error:", err);
	});
