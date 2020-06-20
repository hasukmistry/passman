"use strict";

var QRCode = require('qrcode')
const { authenticator } = require('@otplib/preset-default')
const cryptoRandomString = require('crypto-random-string')

var Sequence = require('futures').sequence
    , Promise = require('future')

const CryptoJS = require("crypto-js")

class gauth {
    // 152-bit WEP Key
    _secret = authenticator.generateSecret()

    // Name of the service.
    _service = 'Password Manager'

    getQrCode() {
        // generate a qr code

        let user_email = process.env.PASSMAN_APP_USER_EMAIL

        var promise = Promise()

        // lets see if master unlock code is saved inside database
        const db = require('./db')

        let main = this

        try {
            // lets extract user details from database
            db.serialize(function() {
                db.each(`SELECT * from user where email="${user_email}";`, function(err, row) {
                    let mastercode,isEnabled,authSecret

                    // nothing is saved in database
                    if (row.google_authenticator_master_code == null) {
                        const token = cryptoRandomString({length: 6, type: 'numeric'})
                        mastercode = token.toString()
                    } else {
                        mastercode = CryptoJS.RC4.decrypt(row.google_authenticator_master_code, process.env.PASSMAN_GAUTH_KEY).toString(CryptoJS.enc.Utf8)
                    }

                    if (row.is_google_authenticator == null) {
                        isEnabled = 0
                    } else {
                        isEnabled = row.is_google_authenticator
                    }

                    if (row.google_authenticator_secret == null) {
                        authSecret = main._secret
                    } else {
                        authSecret = CryptoJS.RC4.decrypt(row.google_authenticator_secret, process.env.PASSMAN_GAUTH_KEY).toString(CryptoJS.enc.Utf8)
                    }

                    // v11.x and above
                    const otpauth = authenticator.keyuri(user_email, main._service, authSecret)

                    // generate qr code below
                    Sequence()
                        .then(function(next) {
                            QRCode.toDataURL(otpauth, function (err, url) {
                                // console.log(url)

                                promise.fulfill(undefined, {
                                    url: url,
                                    isEnabled: isEnabled,
                                    mastercode: mastercode,
                                    authSecret: authSecret
                                })

                                next()
                            })
                        })
                })
            })
        } catch(err) {
            console.log(err.toString())
        }

        return promise
    }

    verifyQrCode(token, secret) {
        const { authenticator } = require('otplib')

        let isValid = false
        try {
            isValid = authenticator.verify({ token, secret })
        } catch(err) {
            isValid = false
        }

        return isValid
    }
}

module.exports = gauth
