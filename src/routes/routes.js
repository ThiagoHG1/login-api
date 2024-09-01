const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const connection = require('../config/db.js');
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

function isValidEmail(email) {
    const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domain = email.split('@')[1];
    return emailRegex.test(email) && allowedDomains.includes(domain);
}

router.post('/register', async (req, res) => {
    // Capture username, password, confirm_password, and email from the request body
    const { username, password, confirm_password, email } = req.body;

    if (!username || !password || !confirm_password || !email) {
        return res.status(400).send('All fields are required.');
    } else if (password.length < 6) {
        return res.status(400).send('The password must contain at least 6 digits.');
    } else if (confirm_password != password) {
        return res.status(400).send('The passwords do not match.');
    } else if (!isValidEmail(email)) {
        return res.status(400).send('Invalid email format.');
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

        const hashedPassword = await argon2.hash(password);

        await connection.query(
            'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email]
        );

        res.status(201).send('User registered successfully!');

    } catch (err) {
        res.status(500).send('Error verifying');
    }
});

router.post('/login', async (req, res) => {
    // Capture the username and password from the request body
    const { username, password } = req.body;

    // Check if the data was provided
    if (!username || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Query to fetch the user by username
        const [results] = await connection.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (results.length > 0) {
            const user = results[0];

            // Verify if the provided password matches the stored hash
            const isMatch = await argon2.verify(user.password_hash, password);

            if (isMatch) {
                // Generate a JWT token
                const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

                // Return success with the token
                return res.json({
                    message: 'Login successful',
                    token: token
                });
            } else {
                // If the password is incorrect, return an error
                res.status(401).send('Incorrect username or password');
            }
        } else {
            // If the user is not found, return an error
            res.status(401).send('Incorrect username or password');
        }
    } catch (err) {
        // If an error occurs, return a 500 error
        res.status(500).send('Error verifying user');
    }
});

module.exports = router;