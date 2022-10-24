const levenshtein = require('fast-levenshtein');
const axios = require('axios').default;

exports.searchGame = (gameName) => {
    return new Promise((resolve, reject) => {
        const headers = {
            'Referer': 'https://howlongtobeat.com/'
        }
        axios.post('https://www.howlongtobeat.com/api/search', buildRequestBody(gameName), {
                    headers: headers
            })
            .then(response => {
                const games = response.data.data.map(gameData => parseGameData(gameData, gameName))
                resolve(games);
            })
            .catch((err) => {
                reject(err.message);
            });
    });
}

const buildRequestBody = (gameName) => {
    return {
        searchType: "games",
        searchTerms: [
            gameName
        ],
        searchPage: 1,
        size: 100,
        searchOptions: {
            games: {
                userId: 0,
                platform: "",
                sortCategory: "popular",
                rangeCategory: "main",
                rangeTime: {
                    min: 0,
                    max: 0
                },
                gameplay: {
                    perspective: "",
                    flow: "",
                    genre: ""
                },
                modifier: ""
            },
            users: {
                sortCategory: "postcount"
            },
            filter: "",
            sort: 0,
            randomizer: 0
        }
    }
}

const parseGameData = (game, searchTerm) => {
    return {
        id: game.game_id,
        name: game.game_name,
        imageUrl: 'https://howlongtobeat.com/games/' + game.game_image,
//        timeLabels: [ [Array], [Array], [Array] ],
        gameplayMain: getTimeInHours(game.comp_main),
        gameplayMainExtra: getTimeInHours(game.comp_plus),
        gameplayCompletionist: getTimeInHours(game.comp_100),
        similarity: calcDistancePercentage(game.game_name, searchTerm),
        searchTerm: searchTerm
    };
}

const getTimeInHours = (gameTime) => {
    const hours = gameTime / 3600;
    let hoursRounded
    if ((hours % 1) >= 0.5) {
        hoursRounded = Math.floor(hours) + 0.5;
    } else {
        hoursRounded = Math.floor(hours);
    }
    return hoursRounded;
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
    console.log(text)
    console.log(shorter)
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