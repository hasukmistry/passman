const CryptoJS = require("crypto-js")

exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            const db = require('../../../../utils/db')

            let entered_code = req.body.code.toString()

            try {
                // lets verify code
                db.serialize(function() {
                    db.each("SELECT * from user;", function(err, row) {
                        let mastercode,isGauthEnabled, authSecret

                        // lets get google authenticator details
                        isGauthEnabled = row.is_google_authenticator

                        mastercode = CryptoJS.RC4.decrypt(row.google_authenticator_master_code, process.env.PASSMAN_GAUTH_KEY).toString(CryptoJS.enc.Utf8)

                        authSecret = CryptoJS.RC4.decrypt(row.google_authenticator_secret, process.env.PASSMAN_GAUTH_KEY).toString(CryptoJS.enc.Utf8)

                        // if its master code.
                        if ( mastercode === entered_code ) {
                            res.json({ status: true, name: row.name, email: row.email, isGauthEnabled: isGauthEnabled })
                        } else {
                            const gauth = require('../../../../utils/gauth')

                            let ga = new gauth()

                            let isValid = ga.verifyQrCode(entered_code, authSecret)

                            res.json({ status: isValid, name: row.name, email: row.email, isGauthEnabled: isGauthEnabled })
                        }
                    })
                })
            } catch ( error ) {
                res.json({ status: false })
            }
        } else {
            // invalid nonce.
            res.send(401).send('Security breach, Invalid nonce detacted.')
        }
    } else {
        // nonce is not passed.
        res.send(401).send('Security breach, No security nonce found.')
    }
}