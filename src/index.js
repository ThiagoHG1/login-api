/** This code is the property of Thiago Henrique Gegers. Removing or altering this line may result in a breach of the license terms. All rights reserved. */
const express = require('express');
const connection = require('./config/db.js');

const app = express();
app.use(express.json());

const port = 3000;

app.post('/register', async (req, res) => {
    // Capture username, password, confirm_password, and email from the request body
    const { username, password, confirm_password, email } = req.body;

    if (!username || !password || !confirm_password || !email) {
        return res.status(400).send('All fields are required.');
    } else if (password.length < 6) {
        return res.status(400).send('The password must contain at least 6 digits.');
    } else if (confirm_password != password) {
        return res.status(400).send('The passwords do not match.');
    }

    try {
        // Query to check if username or email exists
        const [results] = await connection.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        ); 

        if (results.length > 0) {
            return res.status(409).send('Username or email already exists.');
        }

        await connection.query(
            'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
            [username, password, email]
        );

        res.status(201).send('User registered successfully!');

    } catch (err) {
        res.status(500).send('Error verifying');
    }
});

app.post('/login', async (req, res) => {
    // Capture the username and password from the request body
    const { username, password } = req.body;

    // Check if the data was provided
    if (!username || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Query to check if the username and password are correct
        const [results] = await connection.query(
            'SELECT * FROM users WHERE username = ? AND password_hash = ?',
            [username, password]
        );

        if (results.length > 0) {
            // If the user is found, return success
            res.send('Login successful');
        } else {
            // If the user is not found, return error
            res.status(401).send('Incorrect username or password');
        }
    } catch (err) {
        // If an error occurs, return error 500
        res.status(500).send('Error verifying user');
    }
});

app.delete('/delete-user', async (req, res) => {
    const { username, password, confirm_password } = req.body;

    // Check if the data was provided
    if (!username || !password || !confirm_password) {
        return res.status(400).send('All fields are required.');
    } else if (confirm_password != password) {
        return res.status(400).send('The passwords do not match.');
    }

    try {
        // Query to check if the username and password are correct
        const [results] = await connection.query(
            'SELECT * FROM users WHERE username = ? AND password_hash = ?',
            [username, password]
        );

        if (results.length === 0) {
            return res.status(404).send('User not found or incorrect password');
        }

        // Remove the user from the database
        await connection.query(
            'DELETE FROM users WHERE username = ? AND password_hash = ?',
            [username, password]
        );

        res.status(201).send('User deleted successfully'); // Status 204 indicates success with no content to return
        
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
    }
});

app.listen(port, () => {
    console.log(`Login API running on port ${port}`);
});