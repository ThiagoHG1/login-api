/** This code is the property of Thiago Henrique Gegers. Removing or altering this line may result in a breach of the license terms. All rights reserved. */
const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const connection = require('./config/db.js');

const app = express();
app.use(express.json());

const port = 3000;
const SECRET_KEY = 'your-secret-key'; // Change for a strong secret key 

// Middleware for verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Stores the decoded user in the req object
        next(); // Continue to the next middleware or route
    });
}

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

app.post('/login', async (req, res) => {
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

app.delete('/delete-user', authenticateToken, async (req, res) => {
    const { username, password, confirm_password } = req.body;

    // Check if the data was provided
    if (!username || !password || !confirm_password) {
        return res.status(400).send('All fields are required.');
    } else if (confirm_password !== password) {
        return res.status(400).send('The passwords do not match.');
    }

    // Check if the username in the request matches the authenticated user's username
    if (username !== req.user.username) {
        return res.status(403).send('You can only delete your own account.');
    }

    try {
        // Query to fetch the user by username
        const [results] = await connection.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];

        // Verify if the provided password matches the stored hash
        const isMatch = await argon2.verify(user.password_hash, password);

        if (!isMatch) {
            return res.status(401).send('Incorrect password');
        }

        // Remove the user from the database
        await connection.query(
            'DELETE FROM users WHERE username = ?',
            [username]
        );

        res.status(200).json({
            message: 'User deleted successfully',
            user: req.user
        });

    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
    }
});

app.listen(port, () => {
    console.log(`Login API running on port ${port}`);
});