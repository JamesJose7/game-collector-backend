const { db } = require('../util/admin');

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
