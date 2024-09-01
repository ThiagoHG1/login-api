/** This code is the property of Thiago Henrique Gegers. Removing or altering this line may result in a breach of the license terms. All rights reserved. */
const express = require('express');
const argon2 = require('argon2');
const connection = require('../config/db.js');
const { authenticateToken } = require('../middleware/middleware.js');

const router = express.Router();

router.delete('/delete-user', authenticateToken, async (req, res) => {
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

module.exports = router;