const CryptoJS = require("crypto-js")

exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            const db = require('../../../../utils/db')

            let entered_password = req.body.password

            try {
                // lets get status
                db.serialize(function() {
                    db.each("SELECT * from user;", function(err, row) {
                        let isGauthEnabled

                        const password = CryptoJS.Rabbit.decrypt(row.password, process.env.PASSMAN_PASSWORD_KEY).toString(CryptoJS.enc.Utf8)

                        // lets get google authenticator details
                        if (row.is_google_authenticator == null) {
                            isGauthEnabled = 0
                        } else {
                            isGauthEnabled = row.is_google_authenticator
                        }

                        // if app is already running.
                        // user has just minimized a window.
                        // this will skip google authentication to avoid annoying users.
                        // this env is set by main process, index.js
                        if ( process.env.PASSMAN_BY_PASS_GAUTH ) {
                            isGauthEnabled = 0
                        }

                        if ( password === entered_password ) {
                            // not available inside vue js
                            process.env.PASSMAN_APP_USER_EMAIL = row.email

                            res.json({ status: true, name: row.name, email: row.email, isGauthEnabled: isGauthEnabled })
                        } else {
                            res.json({ status: false })
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