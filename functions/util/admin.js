const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./service-account-file.json');

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://gamecollectorrev.firebaseio.com'
});

const db = getFirestore();

// TODO: Replace usages of admin outside this file
module.exports = { admin, db };