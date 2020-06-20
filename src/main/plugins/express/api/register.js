const CryptoJS = require("crypto-js")

exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            const name = req.body.name
            const email = req.body.email

            // https://cryptojs.gitbook.io/docs/
            const password = CryptoJS.Rabbit.encrypt(req.body.password, process.env.PASSMAN_PASSWORD_KEY).toString()

            // lets generate public key only if its not exists.
            const fs = require('fs');
            const filename = 'public.keyfile';
            const public_key_file = `${process.env.PASSMAN_USER_DIR}${filename}`;

            fs.access(public_key_file, fs.constants.F_OK, (err) => {
                if ( err ) {
                    // Public key file does not exists, lets create one

                    // https://www.npmjs.com/package/crypto-random-string.
                    const cryptoRandomString = require('crypto-random-string');

                    let key = cryptoRandomString({length: 32, type: 'base64'});

                    // generated key by software
                    // console.log(key)

                    // Stores key to file in binary form.
                    let wstream = fs.createWriteStream(public_key_file);

                    // https://cryptojs.gitbook.io/docs/
                    let data = CryptoJS.TripleDES.encrypt(key, process.env.PASSMAN_PUBLIC_SECURITY_KEY).toString()

                    wstream.write( data );

                    wstream.end();
                }
            });

            const db = require('../../../../utils/db')

            // lets save it inside database
            db.serialize(function() {
                var stmt = `INSERT INTO user(name,email,password) VALUES ("${name}","${email}","${password}")`

                // run statment
                db.run(stmt)

                res.json({ status: true })
            })
        } else {
            // invalid nonce.
            res.send(401).send('Security breach, Invalid nonce detacted.')
        }
    } else {
        // nonce is not passed.
        res.send(401).send('Security breach, No security nonce found.')
    }
}