const { db } = require('../util/admin');

exports.postOnePublisher = (req, res) => {
    if (req.body.name.trim() === '')
        return res.status(400).json({ name: 'Name must not be empty' });

    const newPublisher = {
        name: req.body.name
    };

    db.collection('publishers')
        .add(newPublisher)
        .then(doc => {
            const responsePublisher = newPublisher;
            responsePublisher.publisherId = doc.id;
            res.json(responsePublisher);
        })
        .catch(err => {
            response.status(500).json({ error: 'Something went wrong' });
            console.error(err);
        });
};

exports.getOnePublisher = (req, res) => {
    let publisher = {};
    db.doc(`/publishers/${req.params.publisherId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Publisher not found' });
            publisher = doc.data();
            publisher.publisherId = doc.id;
            return res.json(publisher);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.getPublishers = (req, res) => {
    db.collection('publishers')
        .orderBy('name', 'asc')
        .get()
        .then(data => {
            let publishers = [];
            data.forEach(doc => {
                publishers.push({
                    publisherId: doc.id,
                    name: doc.data().name
                });
            });
            return res.json(publishers);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
