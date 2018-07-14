![EOS TITAN](./eos_logo_white.jpg "EOS TITAN")

[https://eostitan.com](https://eostitan.com)

# eos-communication

This node.js module allows on-chain encrypted communication on the EOS platform, using the AES shared key encryption algorithm and the memo field in the "transfer" action to send private messages that can only be decrypted by the recipient.

It combines the sender's private key and the receiver's public key (using the account's active permission) to create a public key for encryption.

Decryption is achieved by combining the receiver's private key and the sender's public key to create the private key necessary to decrypt the message.

This module uses eosjs and eosjs-ecc to communicate with the EOS network and to perform the required cryptographic operations.

## Configuration:

Please make sure <a href='https://nodejs.org/en/'>node.js</a> is installed on your system (tested with version 8.11.3).

Clone the repository and install packages:

```
git clone https://github.com/eostitan/eos-communication
cd eos-communication
npm install
```

### Optional:

Copy keyRing.sample to keyRing.js and edit the accounts you want to send from, or to receive with.

Copy sample.env to .env and configure the http endpoint you want to use to connect to the EOS network.

## Usage:

Using keyRing.js and .env configuration
```
const eosCommunications = require("./index.js");

const eosComm = new eosCommunications();
```

#### OR

Using constructor parameters

```
const eosCommunications = require("./index.js");

const opts = {
	network:{
		httpEndpoint: "http://api.eostitan.com",
		chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
	},
	keys:[
		{
			"account":  "myeosaccount", //account name
			"priv_key": "5.....", //priv key
			"pub_key":  "EOS...." //pub key
		}
	]
}

const eosComm = new eosCommunications(opts);
```

## Functions:

### .send : encrypt and send a message in the memo field of a transfer

fromAcct: account you want to send the message from

toAcct: account to which you want to send the message to

message: the message to be encrypted

amount: amount of the transfer (default 0.0001)


```
eosComm.send(fromAcct, toAcct, message, amount)
	.then(result=>{
		console.log(result);
	})
	.catch(err=>{
		console.log("error sending message:", err);
	});
```

### .scanForMessages : scan a block for any messages addressed to one of your accounts

block_num_or_id: number or hash of block to scan for messages

amount: minimum amount required to include message (default 0.0001)

```
eosComm.scanForMessages(block_num_or_id, amount)
	.then(result=>{
		console.log(result);
	})
	.catch(err=>{
		console.log("error retrieving messages:", err);
	});
```

## Testing

### .encrypt : encrypt a message without sending it

fromAcct: account you want to send the message from

toAcct: account to which you want to send the message to

message: the message to be encrypted

```
eosComm.encrypt(fromAcct, toAcct, message)
	.then(encryptedRes=>{
		console.log(encryptedRes);
	})
	.catch(err=>{
		console.log("encryption error:", err);
	});
```

### .decrypt : decrypt an encrypted message

fromAcct: account from which you received the message

toAcct: account with which you received a message

message: the message to be decrypted

```
eosComm.decrypt(fromAcct, toAcct, message)
	.then(decryptedRes=>{
		console.log(decryptedRes);
	})
	.catch(err=>{
		console.log("decryption error:", err);
	});
```

For full example, see <a href='https://github.com/eostitan/eos-communication/blob/master/example.js'>example.js</a>