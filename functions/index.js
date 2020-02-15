const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { signup, login, getAuthenticatedUser } = require('./handlers/users');

const {
    postOneGame,
    uploadGameCover,
    editGame,
    getGame,
    getGamesByUserAndPlatform
} = require('./handlers/games');
const {
    postOnePublisher,
    getOnePublisher,
    getPublishers
} = require('./handlers/publishers');
const {
    postOnePlatform,
    uploadPlatformCover,
    editPlatform,
    getOnePlatform,
    getPlatformsByUser
} = require('./handlers/platforms');

// User routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/user', FBAuth, getAuthenticatedUser);

// Game routes
app.post('/games', FBAuth, postOneGame);
app.post('/games/:gameId', FBAuth, editGame);
app.post('/games/:gameId/image', FBAuth, uploadGameCover);
app.get('/games/:gameId', FBAuth, getGame);
app.get('/games/:username/:platformId', FBAuth, getGamesByUserAndPlatform);

// Platforms routes
app.post('/platforms', FBAuth, postOnePlatform);
app.post('/platforms/:platformId', FBAuth, editPlatform);
app.post('/platforms/:platformId/image', FBAuth, uploadPlatformCover);
app.get('/platforms/:platformId', FBAuth, getOnePlatform);
app.get('/platforms', FBAuth, getPlatformsByUser);

// Publishers routes
app.post('/publishers', FBAuth, postOnePublisher);
app.get('/publishers/:publisherId', FBAuth, getOnePublisher);
app.get('/publishers', FBAuth, getPublishers);

// Export express routes
exports.api = functions.https.onRequest(app);
