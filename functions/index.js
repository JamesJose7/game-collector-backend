const functions = require('firebase-functions');
const app = require('express')();

const { db } = require('./util/admin');

const { signup, login } = require('./handlers/users');

// User routes
app.post('/signup', signup);
app.post('/login', login);

// Export express routes
exports.api = functions.https.onRequest(app);
