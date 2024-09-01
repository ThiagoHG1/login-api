/** This code is the property of Thiago Henrique Gegers. Removing or altering this line may result in a breach of the license terms. All rights reserved. */
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

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

module.exports = { authenticateToken };