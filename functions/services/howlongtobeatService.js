const levenshtein = require('fast-levenshtein');
const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

const axios = require('axios');
const { hltbApi } = require('../util/igdb');

exports.searchGame = (gameName) => {
    return new Promise((resolve, reject) => {
        const urlWithQuery = `${hltbApi}${encodeURI(gameName)}`
        
        axios
            .get(urlWithQuery)
            .then(response => {
                console.log(response.data);
                const game = parseGameData(response.data, gameName)
                resolve(game);
            })
            .catch((err) => {
                reject(err);
            });

        // hltbService.search(gameName)
        //     .then(response => {
        //         const games = response.map(gameData => parseGameData(gameData, gameName))
        //         resolve(games);
        //     })
        //     .catch((err) => {
        //         reject(err);
        //     });
    });
}

const parseGameData = (game, searchTerm) => {
    return {
        id: game.game_id,
        name: game.game_name,
        imageUrl: game.game_image_url,
//        timeLabels: [ [Array], [Array], [Array] ],
        gameplayMain: game.main_story,
        gameplayMainExtra: game.main_extra,
        gameplayCompletionist: game.completionist,
        similarity: calcDistancePercentage(game.game_name, searchTerm),
        searchTerm: searchTerm
    };
}

/**
* Calculates the similarty of two strings based on the levenshtein distance in relation to the string lengths.
* It is used to see how similar the search term is to the game name. This, of course has only relevance if the search term is really specific and matches the game name as good as possible.
* When using a proper search index, this would be the ranking/rating and much more sophisticated than this helper.
* @param text the text to compare to
* @param term the string of which the similarity is wanted
*/
const calcDistancePercentage = (text, term) => {
    let longer = text.toString().toLowerCase().trim();
    let shorter = term.toString().toLowerCase().trim();
    if (longer.length < shorter.length) {
        // longer should always have
        // greater length
        let temp = longer;
        longer = shorter;
        shorter = temp;
    }
    let longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    let distance = levenshtein.get(longer, shorter);
    return Math.round(((longerLength - distance) / longerLength) * 100) / 100;
}