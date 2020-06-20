exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            let regStatus = false

            const db = require('../../../../utils/db')

            // lets get status
            db.serialize(function() {
                db.each("SELECT count(*) as total from user", function(err, row) {
                    regStatus = row.total === 0 ? false : true

                    res.json({ status: regStatus })
                })
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