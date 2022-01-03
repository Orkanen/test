//IMPORTED FROM EMMA

const sqlite3 = require('sqlite3').verbose();

const database = {
    getDb: function getDb() {
        let db = new sqlite3.Database('esc.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the scooter database.');
        });

        return db;
    }
};

module.exports = database;
