const { admin, db } = require('../util/admin');

const config = require('../util/config');

const { reducePlatformDetails } = require('../util/validators');

exports.postOnePlatform = (req, res) => {
    const newPlatform = {
        user: req.user.username,
        name: req.body.name,
        imageUri: req.body.imageUri,
        color: req.body.color
    };

    db.collection('platforms')
        .add(newPlatform)
        .then(doc => {
            const responsePlatform = newPlatform;
            responsePlatform.platformId = doc.id;
            res.json(responsePlatform);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong, please try again'
            });
        });
};

exports.getOnePlatform = (req, res) => {
    let platformData = {};
    db.doc(`/platforms/${req.params.platformId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res
                    .status(404)
                    .json({ error: 'Platform does not exist' });
            platformData = doc.data();
            platformData.platformId = doc.id;
            return res.json(platformData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err.code });
        });
};

exports.getPlatformsByUser = (req, res) => {
    db.collection('platforms')
        .where('user', '==', req.user.username)
        .orderBy('name', 'asc')
        .get()
        .then(data => {
            let userPlatforms = [];
            data.forEach(doc => {
                userPlatforms.push({
                    platformId: doc.id,
                    user: doc.data().user,
                    name: doc.data().name,
                    imageUri: doc.data().imageUri,
                    color: doc.data().color
                });
            });
            return res.json(userPlatforms);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Edit platform
exports.editPlatform = (req, res) => {
    let editedPlatform = reducePlatformDetails(req.body);

    db.doc(`/platforms/${req.params.platformId}`)
        .update(editedPlatform)
        .then(() => {
            return res.json({ message: 'Game edited successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

// Upload platform cover
exports.uploadPlatformCover = (req, res) => {
    db.doc(`/platforms/${req.params.platformId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res
                    .status(404)
                    .json({ error: 'Platform does not exist' });
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
                        imageFileName = `${req.params.platformId}.png`;
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
                                .doc(`/platforms/${req.params.platformId}`)
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
