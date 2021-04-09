const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const {
    signup,
    login,
    getAuthenticatedUser,
    signupUserdetails,
} = require('./handlers/users');

const {
    postOneGame,
    uploadGameCover,
    deleteGame,
    editGame,
    getGame,
    getGamesByUserAndPlatform,
} = require('./handlers/games');
const {
    postOnePublisher,
    getOnePublisher,
    getPublishers,
} = require('./handlers/publishers');
const {
    postOnePlatform,
    uploadPlatformCover,
    editPlatform,
    getOnePlatform,
    getPlatformsByUser,
} = require('./handlers/platforms');
const { getUserStats } = require('./handlers/stats');
const { twitchAuth } = require('./handlers/igdb');

// User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/signupUserdetails', signupUserdetails);
app.get('/user', FBAuth, getAuthenticatedUser);

// Game routes
app.post('/games', FBAuth, postOneGame);
app.post('/games/:gameId', FBAuth, editGame);
app.post('/games/:gameId/image', FBAuth, uploadGameCover);
app.post('/games/:gameId/delete', FBAuth, deleteGame);
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

// Stats routes
app.get('/stats', FBAuth, getUserStats);

// IGDB routes
app.get('/igdbAuth', twitchAuth);

// Export express routes
exports.api = functions.https.onRequest(app);

// Function triggers

// Create stats document on user create
exports.createStatsOnNewUser = functions.firestore
    .document('users/{id}')
    .onCreate((snapshot) => {
        const data = snapshot.data();
        const stats = {
            user: data.username,
            userId: data.userId,
            physicalTotal: 0,
            digitalTotal: 0,
            completedGamesTotal: 0,
            lastGameCompleted: '',
            platforms: [],
        };

        return db
            .collection('stats')
            .add(stats)
            .then((doc) => {
                console.info('Successfully added stats for user: ' + doc.user);
            })
            .catch((err) => {
                console.error(err);
            });
    });

// Create platform stats object on new platform
exports.createPlatformStatsOnNewPlatform = functions.firestore
    .document('platforms/{id}')
    .onCreate((snapshot) => {
        const platform = snapshot.data();
        // Get stats for current user
        return db
            .collection('stats')
            .where('user', '==', platform.user)
            .limit(1)
            .get()
            .then((data) => {
                data.forEach((stats) => {
                    // Add new stats about platform
                    const newPlatformStats = {
                        platformId: snapshot.id,
                        platformName: platform.name,
                        physicalTotal: 0,
                        digitalTotal: 0,
                        completedGamesTotal: 0,
                        lastGameCompleted: '',
                    };
                    const previousStats = stats.data();
                    previousStats.platforms.push(newPlatformStats);
                    // Update stats object
                    db.collection('stats')
                        .doc(stats.id)
                        .set(previousStats)
                        .then(() =>
                            console.info('Platform stats created successfully')
                        )
                        .catch((err) => console.error(err));
                });
            })
            .catch((err) => {
                console.error(err);
            });
    });

// Update stats on game creation
exports.updateStatsOnGameCreation = functions.firestore
    .document('games/{id}')
    .onCreate((snapshot) => {
        const game = snapshot.data();
        // Get stats for current user
        return db
            .collection('stats')
            .where('user', '==', game.user)
            .limit(1)
            .get()
            .then((data) => {
                data.forEach((doc) => {
                    let stats = doc.data();
                    let platformStats = stats.platforms.filter(
                        (platform) => platform.platformId === game.platformId
                    )[0];
                    // Update stats
                    if (game.isPhysical) {
                        stats.physicalTotal++;
                        platformStats.physicalTotal++;
                    } else {
                        stats.digitalTotal++;
                        platformStats.digitalTotal++;
                    }
                    // Check if user has already finished the game
                    if (game.timesCompleted > 0) {
                        stats.completedGamesTotal++;
                        platformStats.completedGamesTotal++;
                        stats.lastGameCompleted = game.name;
                        platformStats.lastGameCompleted = game.name;
                    }
                    // Update stats object
                    stats.platforms = stats.platforms.map((platform) => {
                        if (platform.platformId === platformStats.platformId)
                            return platformStats;
                        else return platform;
                    });

                    db.collection('stats')
                        .doc(doc.id)
                        .set(stats)
                        .then(() => console.info('Stats updated successfully'))
                        .catch((err) => console.error(err));
                });
            })
            .catch((err) => {
                console.error(err);
            });
    });

// Update stats on game update
exports.updateStatsOnGameUpdate = functions.firestore
    .document('games/{id}')
    .onUpdate((change) => {
        const before = change.before.data();
        const after = change.after.data();

        // Update stats
        return db
            .collection('stats')
            .where('user', '==', after.user)
            .limit(1)
            .get()
            .then((data) => {
                data.forEach((doc) => {
                    let stats = doc.data();
                    let platformStats = stats.platforms.filter(
                        (platform) => platform.platformId === after.platformId
                    )[0];
                    // Did user changed isPhysical?
                    if (before.isPhysical != after.isPhysical) {
                        if (before.isPhysical) {
                            // Changed to digital
                            stats.physicalTotal--;
                            platformStats.physicalTotal--;
                            stats.digitalTotal++;
                            platformStats.digitalTotal++;
                        } else if (!before.isPhysical) {
                            // Changed to physical
                            stats.physicalTotal++;
                            platformStats.physicalTotal++;
                            stats.digitalTotal--;
                            platformStats.digitalTotal--;
                        }
                    }
                    // Did user update times completed?
                    if (before.timesCompleted !== after.timesCompleted) {
                        if (after.timesCompleted === 0) {
                            // Game was finished but he apparently changed his mind
                            stats.completedGamesTotal--;
                            platformStats.completedGamesTotal--;
                        } else if (after.timesCompleted > 0) {
                            // Has now finished the game
                            stats.completedGamesTotal++;
                            platformStats.completedGamesTotal++;
                            stats.lastGameCompleted = after.name;
                            platformStats.lastGameCompleted = after.name;
                        }
                    }
                    // Update stats object
                    stats.platforms = stats.platforms.map((platform) => {
                        if (platform.platformId === platformStats.platformId)
                            return platformStats;
                        else return platform;
                    });

                    db.collection('stats')
                        .doc(doc.id)
                        .set(stats)
                        .then(() => console.info('Stats updated successfully'))
                        .catch((err) => console.error(err));
                });
            })
            .catch((err) => {
                console.error(err);
            });
    });

// Update stats on game deletion
exports.updateStatsOnGameDelete = functions.firestore
    .document('games/{id}')
    .onDelete((snapshot, context) => {
        const game = snapshot.data();
        // Get stats for current user
        return db
            .collection('stats')
            .where('user', '==', game.user)
            .limit(1)
            .get()
            .then((data) => {
                data.forEach((doc) => {
                    let stats = doc.data();
                    let platformStats = stats.platforms.filter(
                        (platform) => platform.platformId === game.platformId
                    )[0];
                    // Update stats
                    if (game.isPhysical) {
                        stats.physicalTotal--;
                        platformStats.physicalTotal--;
                    } else {
                        stats.digitalTotal--;
                        platformStats.digitalTotal--;
                    }
                    // Check if user has already finished the game and remove a completion from the totals
                    if (game.timesCompleted > 0) {
                        stats.completedGamesTotal--;
                        platformStats.completedGamesTotal--;
                    }
                    // Update stats object
                    stats.platforms = stats.platforms.map((platform) => {
                        if (platform.platformId === platformStats.platformId)
                            return platformStats;
                        else return platform;
                    });

                    db.collection('stats')
                        .doc(doc.id)
                        .set(stats)
                        .then(() => console.info('Stats updated successfully'))
                        .catch((err) => console.error(err));
                });
            })
            .catch((err) => {
                console.error(err);
            });
    });
