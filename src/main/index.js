'use strict'

import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'

require('dotenv').config()

const cryptoRandomString = require('crypto-random-string')
const isDevelopment = process.env.NODE_ENV !== 'production'

// creates rights and env variable
require('./plugins/passman')

// creates database - if its not exist
require('./plugins/database')

// start an express server
require('./plugins/server')

// lets create one form token which stays active during app lifetime
process.env.PASSMAN_FORM_TOKEN = cryptoRandomString({length: 6, type: 'url-safe'})

// reads pass key from .env to encrypt and decrypt password.
// Rabbit - encrypt/decrypt
process.env.PASSMAN_PASSWORD_KEY = process.env.PASSWORD_KEY

// reads security key from .env to encrypt and decrypt public key
// TripleDES - encrypt/decrypt
process.env.PASSMAN_PUBLIC_SECURITY_KEY = process.env.SECURITY_KEY

// reads security key from .env to encrypt and decrypt google auth settings
// RC4 - encrypt/decrypt
process.env.PASSMAN_GAUTH_KEY = process.env.GAUTH_KEY

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow () {
    // Create the browser window.
    const window = new BrowserWindow({
        width: 800,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    if ( isDevelopment ) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))
    }

    window.on('closed', () => {
        mainWindow = null
    })

    window.on('minimize', () => {
        // destroy session of current user
        process.env.PASSMAN_APP_USER_EMAIL = ''

        // app is already running, lets avoid asking google authenticator code.
        process.env.PASSMAN_BY_PASS_GAUTH = true
    })

    return window
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    mainWindow = createMainWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow()
    }
})
