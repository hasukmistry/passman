const express = require('express')
const router = express.Router()

const regStatus = require('./api/regStatus')
const login = require('./api/login')
const gAuthVerification = require('./api/verifyGoogleAuthenticator')
const register = require('./api/register')
const encrypt = require('./api/encrypt')
const entries = require('./api/entries')
const entry = require('./api/entry')
const readImage = require('./api/readImage')
const googleAuth = require('./api/getGoogleAuthenticatorQr')
const settings = require('./api/settings')
const generate = require('./api/generateNewKey')
const removeEntry = require('./api/removeEntry')

// middleware to attach cors
router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    next()
})

router.post('/regStatus', regStatus.api)

router.post('/login', login.api)

router.post('/gauth', gAuthVerification.api)

router.post('/register', register.api)

router.post('/encrypt', encrypt.api)

router.post('/entries', entries.api)

router.post('/entry', entry.api)

router.post('/settings', settings.api)

router.post('/generate', generate.api)

router.post('/remove-entry', removeEntry.api)

router.get('/image/:nonce/file/:name', readImage.api)

router.get('/qrcode/:nonce', googleAuth.api)

module.exports = router