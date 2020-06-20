'use strict'

import { app } from 'electron'

const fs = require('fs')

// creates directory on user's home
// https://www.electronjs.org/docs/api/app#appgetpathname
const homeDir = app.getPath('home');

const platform = require('../../utils/platform')

const currentPlatform = platform.get

let uploadLocation;
// to display correct path to user when user is in windows machine
if (currentPlatform === 'WINDOWS') {
    uploadLocation = `${homeDir}\\passman\\`;
} else {
    uploadLocation = `${homeDir}/passman/`;
}

if (!fs.existsSync(uploadLocation)){
    fs.mkdirSync(uploadLocation);
}

let uploadImageLocation = `${homeDir}/passman/temp/`;
if (!fs.existsSync(uploadImageLocation)){
    fs.mkdirSync(uploadImageLocation);
}

// register env variable to location
process.env.PASSMAN_USER_DIR = uploadLocation

// register env variable to image location
process.env.PASSMAN_IMG_DIR = uploadImageLocation
