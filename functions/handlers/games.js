const { db } = require('../util/admin');

const { reduceGameDetails } = require('../util/validators');

// Post a game from user
exports.postOneGame = (req, res) => {
    // TODO: Remove date check, it's only for bulk migration of previous data
    let date;
    if (req.body.dateAdded !== undefined) date = req.body.dateAdded;
    else date = new Date().toISOString();

    const newGame = {
        user: req.user.username,
        dateAdded: date,
        imageUri: req.body.imageUri,
        isPhysical: req.body.isPhysical,
        name: req.body.name,
        shortName: req.body.shortName,
        platformId: req.body.platformId,
        platform: req.body.platform,
        publisherId: req.body.publisherId,
        publisher: req.body.publisher,
        timesCompleted: req.body.timesCompleted
    };

    db.collection('games')
        .add(newGame)
        .then(doc => {
            const responseGame = newGame;
            responseGame.gameId = doc.id;
            res.json(responseGame);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
};

// Edit game
exports.editGame = (req, res) => {
    let editedGame = reduceGameDetails(req.body);

    db.doc(`/games/${req.params.gameId}`)
        .update(editedGame)
        .then(() => {
            return res.json({ message: 'Game edited successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Get one game
exports.getGame = (req, res) => {
    let gameData = {};
    db.doc(`/games/${req.params.gameId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Game not found' });
            gameData = doc.data();
            gameData.gameId = doc.id;
            return res.json(gameData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Get games by user
// Maybe not

// Get games by user and platform
exports.getGamesByUserAndPlatform = (req, res) => {
    db.collection('games')
        .where('user', '==', req.params.username)
        .where('platformId', '==', req.params.platformId)
        .orderBy('name', 'asc')
        .get()
        .then(data => {
            let games = [];
            data.forEach(doc => {
                games.push({
                    gameId: doc.id,
                    user: doc.data().user,
                    dateAdded: doc.data().dateAdded,
                    imageUri: doc.data().imageUri,
                    isPhysical: doc.data().isPhysical,
                    name: doc.data().name,
                    shortName: doc.data().shortName,
                    platformId: doc.data().platformId,
                    platform: doc.data().platform,
                    publisherId: doc.data().publisherId,
                    publisher: doc.data().publisher,
                    timesCompleted: doc.data().timesCompleted
                });
            });
            return res.json(games);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
