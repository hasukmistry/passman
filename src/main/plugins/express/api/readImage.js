exports.api = function (req, res) {
    if(typeof req.params.nonce !== "undefined") {
        if( req.params.nonce === process.env.PASSMAN_FORM_TOKEN ) {
            const fs = require('fs')

            // all the images are stored here
            const image_path = `${process.env.PASSMAN_USER_DIR}`

            const image = decodeURIComponent(req.params.name)

            const image_file = `${image_path}${image}`

            try {
                var s = fs.createReadStream(image_file)

                s.on('open', function () {
                    res.set('Content-Type', 'image/jpeg')
                    s.pipe(res)
                })

                s.on('error', function () {
                    res.set('Content-Type', 'image/jpeg')
                    res.status(404).end('Not found')
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