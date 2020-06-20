const Sequence = require('futures').sequence

const platform = require('../../../../utils/platform')

const currentPlatform = platform.get

exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            let file = decodeURIComponent(req.body.file)

            // all the images are stored here
            const image_path = `${process.env.PASSMAN_USER_DIR}`;

            const decrypt = require('../../../../utils/decrypt')

            let dec = new decrypt(currentPlatform)

            let image = `${image_path}${file}`

            try {
                Sequence()
                    .then(function(next) {
                        dec.decryption(image)
                            .when(function(err, data) {
                                if ( err ) {
                                    // console.log(data)

                                    res.json({ isValid: false, data: {} })
                                } else {
                                    // if public key is replaced.
                                    // and old encrypted images are there.
                                    // json.parse will fail
                                    let json, isValid
                                    try {
                                        isValid = true
                                        json = JSON.parse(data)
                                    } catch (e) {
                                        isValid = false
                                        json = {}
                                    }

                                    res.json({ isValid: isValid, data: json })
                                }
                            })
                    })
            } catch(err) {
                res.send(401).send(err.toString())
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