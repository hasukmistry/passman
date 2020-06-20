const Sequence = require('futures').sequence

exports.api = function (req, res) {
    if(typeof req.params.nonce !== "undefined") {
        if( req.params.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            try {
                const gauth = require('../../../../utils/gauth')

                let ga = new gauth()

                Sequence()
                    .then(function(next) {
                        ga.getQrCode()
                            .when(function(err, data) {
                                res.json({ data: data.url, isEnabled: data.isEnabled, mastercode: data.mastercode, authSecret:data.authSecret })
                            })
                    })
            } catch(error) {
                res.status(404).end(error.toString())
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