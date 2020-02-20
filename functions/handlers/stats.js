const { db } = require('../util/admin');

exports.getUserStats = (req, res) => {
    db.collection('stats')
        .where('user', '==', req.user.username)
        .limit(1)
        .get()
        .then(docs => {
            docs.forEach(doc => {
                if (!doc.exists) 
                    return res.status(404).json({ error: 'User stats not found' });
                const stats = doc.data();
                stats.statsId = doc.id;
                return res.json(stats);
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}