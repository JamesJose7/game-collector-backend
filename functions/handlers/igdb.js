const { admin, db } = require('../util/admin');

const config = require('../util/config');

const { reduceGameDetails } = require('../util/validators');

const axios = require('axios').default;

const { clientID, clientSecret, host } = require('../util/igdb');

// Authenticate with Twitch
exports.twitchAuth = (req, res) => {
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`;

    axios
        .post(twitchAuthUrl)
        .then((response) => {
            return res.json(response.data);
        })
        .catch((err) => {
            console.error(err.message);
            res.status(500).json({ error: 'Something went wrong' });
        });
};
