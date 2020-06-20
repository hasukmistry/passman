"use strict";

const fs = require('fs')
const request = require('request')

var Sequence = require('futures').sequence
    , Promise = require('future')

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
    })
}

class image {
    // gets random number from 1 to 993.
    _page = Math.floor(Math.random() * 993) + 1

    _jsonUrl = ''

    constructor() {
        this._jsonUrl = `https://picsum.photos/v2/list?page=${this._page}&limit=1`
    }

    getRandomImage() {
        var promise = Promise()

        let main = this

        Sequence()
            .then(function(next) {
                // lets fetch random image and then download it to passman directory
                request(main._jsonUrl, { json: true }, (err, res, body) => {
                    if (err) {
                        console.log(err)

                        promise.fulfill(undefined, '')

                        next()
                    } else {
                        let imgId = body[0].id

                        let imgUrl = `https://picsum.photos/id/${imgId}/1024/800`

                        let tempDir = `${process.env.PASSMAN_IMG_DIR}${imgId}.jpg`

                        download(imgUrl, tempDir, () => {
                            console.log('✅ Done, Image downloaded!')

                            promise.fulfill(undefined, tempDir)

                            next()
                        })
                    }
                })
            })

        return promise
    }
}

module.exports = image