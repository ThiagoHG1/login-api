# Basic Login System

This is a basic login system built with Node.js and Express, connected to a MySQL database. It provides functionalities for user registration, login, and account deletion.

## Features

- **User Registration:** Allows new users to register with a username, password, and email. Only valid email formats are accepted (e.g., Gmail, Yahoo).
- **User Login:** Allows users to log in with their username and password.
- **Account Deletion:** Allows users to delete their own account by providing their username and password.
- **Token Authentication:** Implements token-based authentication to secure user sessions.
- **Password Encryption:** Uses Argon2 for password hashing to enhance security.
- **Authorization:** Ensures that users can only perform actions on their own accounts.
- **Protected Routes:** Certain routes are protected and require a valid token for access.
- **Token Verification:** Validates tokens to ensure secure access to protected routes.

## Technologies Used

- **Node.js:** JavaScript runtime environment for server-side code.
- **Express:** Framework for building web applications.
- **MySQL:** Relational database management system.
- **Argon2:** Password hashing algorithm.
- **JWT (JSON Web Tokens):** For authentication and session management.
- **dotenv:** For loading environment variables from a `.env` file.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ThiagoHG1/login-api.git
   cd login-api

2. **Install dependencies:**
   ```bash
   npm install

3. **Configure environment variables:**
   ```bash
   PORT=3000
   HOST=host
   USER=user
   PASSWORD=password
   DATABASE=database
   SECRET_KEY=your-strong-secret-key

4. **Start the server:**
   ```bash
   npm start

## Releases

You can find the release history and download the latest versions of this project from the [Releases page](https://github.com/ThiagoHG1/login-api/releases).

- **Account Deletion:** Allows users to delete their account by providing their username and password.
