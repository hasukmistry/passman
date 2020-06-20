'use strict'

import { app } from 'electron'

const fs = require('fs')

const isDevelopment = process.env.NODE_ENV !== 'production'

const user_data = isDevelopment ? '.' : app.getPath('userData')

const sqlite3 = require('sqlite3').verbose()

// creates folder
let db_location = isDevelopment ? `${user_data}` : `${user_data}/passman-db`

if (!fs.existsSync(db_location)){
    fs.mkdirSync(db_location)
}

let db_file = `${db_location}/passman.db`

const db = new sqlite3.Database(db_file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database from user data location.');
})

// sets db file location as env
process.env.PASSMAN_DB_FILE = db_file

db.serialize(function() {
    db.run('CREATE TABLE if not exists "user" ( "id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT, "email" TEXT, "password" TEXT, "is_google_authenticator" INTEGER DEFAULT 0, "google_authenticator_master_code" TEXT, "google_authenticator_secret" TEXT )')
})

db.close()