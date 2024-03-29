const { admin, db } = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require('../util/validators');

// Sign up users
exports.signup = (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        username: request.body.username
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) return response.status(400).json(errors);

    let token, userId;
    db.doc(`/users/${newUser.username}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                return response
                    .status(400)
                    .json({ username: 'This username is already taken' });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                username: newUser.username,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.username}`).set(userCredentials);
        })
        .then(() => {
            return response.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code == 'auth/email-already-in-use') {
                return response
                    .status(400)
                    .json({ email: 'Email is already in use' });
            }
            return response
                .status(500)
                .json({ general: 'Something went wrong, please try again' });
        });
};

// Sign up new user info when using SDKs signup
exports.signupUserdetails = (request, response) => {
    const newUser = {
        userId: request.body.userId,
        email: request.body.email,
        username: request.body.username
    };

    db.doc(`/users/${newUser.username}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                return response
                    .status(400)
                    .json({ username: 'User initial setup already finished' });
            } else {
                const userCredentials = {
                    username: newUser.username,
                    email: newUser.email,
                    createdAt: new Date().toISOString(),
                    userId: newUser.userId
                };
                return db.doc(`/users/${newUser.username}`).set(userCredentials);
            }
        })
        .then(doc => {
            return response.status(201).json({ message: 'Successfully added user details' });
        })
        .catch(err => {
            console.error(err);
            return response
                .status(500)
                .json({ general: 'Something went wrong, please try again' });
        });
};

// Log in
exports.login = (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) return response.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return response.json({ token });
        })
        .catch(err => {
            console.error(err);
            return response
                .status(403)
                .json({ general: 'Wrong credentials, please try again' });
        });
};

// Get authenticated user details
exports.getAuthenticatedUser = (request, response) => {
    let userData = {};
    db.doc(`/users/${request.user.username}`)
        .get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return response.json(userData);
            }
        })
        .catch(err => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
};