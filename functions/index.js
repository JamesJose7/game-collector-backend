const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { signup, login } = require('./handlers/users');

const {
    postOneGame,
    editGame,
    getGame,
    getGamesByUserAndPlatform
} = require('./handlers/games');
const {
    postOnePublisher,
    getOnePublisher,
    getPublishers
} = require('./handlers/publishers')

// User routes
app.post('/signup', signup);
app.post('/login', login);

// Game routes
app.post('/games', FBAuth, postOneGame);
app.post('/games/:gameId', FBAuth, editGame);
app.get('/games/:gameId', FBAuth, getGame);
app.get('/games/:username/:platformId', FBAuth, getGamesByUserAndPlatform);

// Publishers routes
app.post('/publishers', FBAuth, postOnePublisher);
app.get('/publishers/:publisherId', FBAuth, getOnePublisher)
app.get('/publishers', FBAuth, getPublishers)

// Export express routes
exports.api = functions.https.onRequest(app);
