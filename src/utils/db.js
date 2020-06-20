"use strict";

const sqlite3 = require('sqlite3').verbose();
const isDevelopment = process.env.NODE_ENV !== 'production'

class db {
    // Stores name of database.
    _dbName = isDevelopment ? './passman.db' : process.env.PASSMAN_DB_FILE;

    // Connection object to database.
    _dbObj = null;

    // Logging.
    _debug = false;

    // Number of users in database.
    _countUsers = -1;

    constructor() {
        // Opens up connection after setting debugging mode
        this._debug = process.env.NODE_ENV !== 'production';

        this.init();
    }

    get dbObj() {
        return this._dbObj;
    }

    // Creates database connection.
    init() {
        const db = new sqlite3.Database(this._dbName, sqlite3.OPEN_READWRITE, (err) => {
            if ( this._debug ) {
                if (err) {
                    console.error(err.message);
                }
                console.log('Connected to the database.');
            }
        });

        this._dbObj = db;
    }
}

module.exports = new db().dbObj;
