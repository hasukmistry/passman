exports.api = function (req, res) {
    if(typeof req.body.nonce !== "undefined") {
        if( req.body.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            let file = decodeURIComponent(req.body.file)

            // all the images are stored here
            const image_path = `${process.env.PASSMAN_USER_DIR}`;

            let image = `${image_path}${file}`

            const fs = require('fs')

            fs.access(image, fs.constants.F_OK, (err) => {
                if (err) {
                    // does not exists
                    res.json({ status: false })
                } else {
                    // exists
                    fs.unlink(image, function() {
                        res.json({ status: true })
                    })
                }
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