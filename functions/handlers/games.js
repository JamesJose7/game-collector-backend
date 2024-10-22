const { admin, db } = require('../util/admin');

const config = require('../util/config');

const { reduceGameDetails } = require('../util/validators');

const axios = require('axios').default;
const { apiKey } = require('../util/igdb');

// Post a game from user
const saveGame = (newGame, res) => {
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

exports.postOneGame = (req, res) => {
    // TODO: Remove date check, it's only for bulk migration of previous data
    let date;
    let previousDate = req.body.dateAdded;
    if (previousDate) date = req.body.dateAdded;
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
        timesCompleted: req.body.timesCompleted,
        firstReleaseDate: req.body.firstReleaseDate,
        ageRatings: req.body.ageRatings,
        criticsRating: req.body.criticsRating,
        criticsRatingCount: req.body.criticsRatingCount,
        userRating: req.body.userRating,
        userRatingCount: req.body.userRatingCount,
        totalRating: req.body.totalRating,
        totalRatingCount: req.body.totalRatingCount,
        genres: req.body.genres,
        storyline: req.body.storyline,
        summary: req.body.summary,
        url: req.body.url
    };

    saveGame(newGame, res);

    // TODO: Implement when changing from the free firebase plan
    // get artwork if user did not select one
    // if (newGame.imageUri === undefined || newGame.imageUri.trim() == '') {
    //     // Query for game based on name
    //     axios({
    //         method: 'post',
    //         url: 'https://api-v3.igdb.com/games',
    //         headers: {
    //             'user-key': apiKey,
    //             'Content-Type': 'text/plain'
    //         },
    //         data: `search "${newGame.name}"; fields name,first_release_date, cover, category; where first_release_date != null; limit 15;`
    //     })
    //         .then(response => {
    //             // Filter out DLC
    //             let resultGames = response.data.filter(
    //                 game => game.category !== 1
    //             );
    //             if (resultGames.length > 0) {
    //                 let selectedGame = resultGames[0];
    //                 if (selectedGame.cover !== undefined) {
    //                     // Get game cover URL
    //                     axios({
    //                         method: 'post',
    //                         url: 'https://api-v3.igdb.com/covers',
    //                         headers: {
    //                             'user-key': apiKey,
    //                             'Content-Type': 'text/plain'
    //                         },
    //                         data: `fields game,height,image_id,url,width; where id = ${selectedGame.cover};`
    //                     })
    //                         .then(response => {
    //                             // Set image cover
    //                             let covers = response.data;
    //                             if (covers.length > 0) {
    //                                 // transform URL
    //                                 let imageUrl = covers[0].url;
    //                                 imageUrl = imageUrl.replace(
    //                                     '//',
    //                                     'https://'
    //                                 );
    //                                 imageUrl = imageUrl.replace(
    //                                     't_thumb',
    //                                     't_cover_big'
    //                                 );
    //                                 newGame.imageUri = imageUrl;
    //                             }
    //                             saveGame(newGame, res);
    //                         })
    //                         .catch(err => {
    //                             console.error(err);
    //                             saveGame(newGame, res);
    //                         });
    //                 } else {
    //                     saveGame(newGame, res);
    //                 }
    //             } else {
    //                 saveGame(newGame, res);
    //             }
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             saveGame(newGame, res);
    //         });
    // } else {
    //     saveGame(newGame, res);
    // }
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

// Upload game cover
exports.uploadGameCover = (req, res) => {
    db.doc(`/games/${req.params.gameId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Game does not exist' });
            else {
                const BusBoy = require('busboy');
                const path = require('path');
                const os = require('os');
                const fs = require('fs');

                const busboy = new BusBoy({ headers: req.headers });

                let imageFileName;
                let imageToBeUploaded = {};

                busboy.on(
                    'file',
                    (fieldname, file, filename, encoding, mimetype) => {
                        if (
                            mimetype !== 'image/jpeg' &&
                            mimetype !== 'image/png'
                        )
                            return res
                                .status(400)
                                .json({ error: 'Wrong file type submitted' });
                        // TODO: Transform jpegs into pngs
                        const imageExtension = filename.split('.')[
                            filename.split('.').length - 1
                        ];
                        imageFileName = `${req.params.gameId}.png`;
                        const filepath = path.join(os.tmpdir(), imageFileName);
                        imageToBeUploaded = { filepath, mimetype };
                        file.pipe(fs.createWriteStream(filepath));
                    }
                );
                busboy.on('finish', () => {
                    admin
                        .storage()
                        .bucket(`${config.storageBucket}`)
                        .upload(imageToBeUploaded.filepath, {
                            resumable: false,
                            metadata: {
                                metadata: {
                                    contentType: imageToBeUploaded.mimetype
                                }
                            }
                        })
                        .then(() => {
                            const imageUri = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                            return db
                                .doc(`/games/${req.params.gameId}`)
                                .update({ imageUri });
                        })
                        .then(() => {
                            return res.json({
                                uploaded: true,
                                message: 'Image uploaded successfully'
                            });
                        })
                        .catch(err => {
                            console.error(err);
                            return res.status(500).json({ error: err.code });
                        });
                });
                busboy.end(req.rawBody);
            }
        });
};

// Delete game
exports.deleteGame = (req, res) => {
    db.doc(`/games/${req.params.gameId}`)
        .delete()
        .then(() => {
            // Delete image
            admin
                .storage()
                .bucket(`${config.storageBucket}`)
                .file(`${req.params.gameId}.png`)
                .delete()
                .then(() => {
                    res.json({ message: 'Game deleted successfully' });
                })
                .catch(err => {
                    // There was never a cover stored for this game
                    res.json({ message: 'Game deleted successfully' });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Toggle game completion
exports.toggleGameCompletion = (req, res) => {
    db.doc(`/games/${req.params.gameId}`)
        .get()
        .then((doc) => {
            // Get previous completion
            let { timesCompleted } = doc.data();
            if (timesCompleted == 0)
                timesCompleted = 1;
            else if (timesCompleted > 0)
                timesCompleted = 0;
            // Mark completion date if completed
            let completionDate = ""
            if (timesCompleted > 0) completionDate = new Date().toISOString();
            // Update times completed
            db.doc(`/games/${req.params.gameId}`)
                .update({ timesCompleted, completionDate })
                .then(() => {
                    // Response status
                    return res.json({ 
                        completed: timesCompleted > 0
                     });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ error: err.code });
                });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};