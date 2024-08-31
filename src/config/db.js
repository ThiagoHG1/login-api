/** This code is the property of Thiago Henrique Gegers. Removing or altering this line may result in a breach of the license terms. All rights reserved. */
const mysql = require('mysql2/promise');

// Creates the connection pool for the database
const connection = mysql.createPool({
    host: 'host',
    user: 'user',
    password: 'password',
    database: 'database'
});

// Tests the connection to the database
(async () => {
    try {
        const [rows] = await connection.query('SELECT 1');
        console.log('Connected to the database');
    } catch (err) {
        console.log(`Error connecting to the database: ${err}`);
    }
})();

module.exports = connection;
