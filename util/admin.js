const admin = require('firebase-admin');

const serviceAccount = require('./service-account-file.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://gamecollectorrev.firebaseio.com'
});

const db = admin.firestore();

module.exports = { admin, db };
