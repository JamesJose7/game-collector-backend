const { admin, db } = require('../util/admin');

const config = require('../util/config');

const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

// Authenticate with Twitch
exports.getGameHours = (req, res) => {

    let gameName = req.query.name;

    if (!gameName) {
        return res.status(400).json({ error: 'No game name provided' });
    }

    hltbService.search(gameName)
        .then(games => {
            console.log(games);

            if (games.length > 0) {
                let mostSimilarGame = games.reduce((maxGame, currentGame) => {
                    return maxGame.similarity > currentGame.similarity ? maxGame : currentGame;
                });
                return res.json(mostSimilarGame);
            } else {
                return res.status(404).json({ message: 'No games found' });
            }
        })
        .catch(err => {
            console.error(err.message);
            return res.status(500).json({ error: 'Something went wrong' });
        });
};