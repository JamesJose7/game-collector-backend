const { searchGame } = require("../services/howlongtobeatService");

exports.getGameHours = (req, res) => {
    let gameName = req.query.name;

    if (!gameName) {
        return res.status(400).json({ error: 'No game name provided' });
    }

    searchGame(gameName)
        .then(games => {
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
            console.error(err)
            return res.status(500).json({ error: 'Something went wrong' });
        });
};