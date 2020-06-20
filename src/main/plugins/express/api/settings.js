const CryptoJS = require("crypto-js")

exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            let mcode = CryptoJS.RC4.encrypt(req.body.mastercode, process.env.PASSMAN_GAUTH_KEY).toString()
            let authSecret = CryptoJS.RC4.encrypt(req.body.authSecret, process.env.PASSMAN_GAUTH_KEY).toString()
            let isEnabled = req.body.isEnabled

            // toggle value to 0 or 1.
            // 1 = true
            // 0 = false
            let is_google_authenticator = isEnabled ? 1 : 0;

            const db = require('../../../../utils/db')

            let user_email = process.env.PASSMAN_APP_USER_EMAIL

            try {
                // lets get status
                db.serialize(function() {
                    var stmt = `UPDATE user set is_google_authenticator=${is_google_authenticator}, google_authenticator_master_code='${mcode}', google_authenticator_secret='${authSecret}' where email="${user_email}";`

                    // run statment
                    db.run(stmt)

                    res.json({ status: true })
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