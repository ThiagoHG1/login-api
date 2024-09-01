/** This code is the property of Thiago Henrique Gegers. Removing or altering this line may result in a breach of the license terms. All rights reserved. */
const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes.js');
const protectedRoutes = require('./routes/protected_routes.js');
const { authenticateToken } = require('./middleware/middleware.js');

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;

app.use('/api', routes); // Rotas públicas
app.use('/api', authenticateToken, protectedRoutes); // Rotas protegidas

app.listen(port, () => {
    console.log(`Login API running on port ${port}`);
});