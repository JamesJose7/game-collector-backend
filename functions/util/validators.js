const isEMail = email => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    return false;
};

const isEmpty = string => {
    if (string.trim() == '') return true;
    return false;
};

const isUndefinedOrEmpty = string => {
    if (string == undefined || isEmpty(string)) return true;
    return false;
};

exports.validateSignupData = data => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEMail(data.email)) {
        errors.email = 'Must be a valid email address';
    }

    if (isEmpty(data.password)) errors.password = 'Must not be empty';
    if (data.password !== data.confirmPassword)
        errors.confirmPassword = 'Passwords must be the same';
    if (isEmpty(data.username)) errors.username = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};

exports.validateLoginData = data => {
    let errors = {};

    if (isEmpty(data.email)) errors.email = 'Must not be empty';
    if (isEmpty(data.password)) errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    };
};

exports.reduceGameDetails = data => {
    let game = {};

    if (!isUndefinedOrEmpty(data.imageUri)) 
        game.imageUri = data.imageUri;
    if (data.isPhysical !== undefined) game.isPhysical = data.isPhysical;
    if (!isUndefinedOrEmpty(data.name)) 
        game.name = data.name;
    if (!data.shortName !== undefined)
        game.shortName = data.shortName;
    if (!isUndefinedOrEmpty(data.publisherId))
        game.publisherId = data.publisherId;
    if (!isUndefinedOrEmpty(data.publisher))
        game.publisher = data.publisher;
    if (data.timesCompleted !== undefined)
        game.timesCompleted = data.timesCompleted;
    if (data.firstReleaseDate != undefined)
        game.firstReleaseDate = data.firstReleaseDate
    if (data.ageRatings != undefined)
        game.ageRatings = data.ageRatings
    if (data.criticsRating != undefined)
        game.criticsRating = data.criticsRating
    if (data.criticsRatingCount != undefined)
        game.criticsRatingCount = data.criticsRatingCount
    if (data.userRating != undefined)
        game.userRating = data.userRating
    if (data.userRatingCount != undefined)
        game.userRatingCount = data.userRatingCount
    if (data.totalRating != undefined)
        game.totalRating = data.totalRating
    if (data.totalRatingCount != undefined)
        game.totalRatingCount = data.totalRatingCount
    if (data.genres != undefined)
        game.genres = data.genres
    if (!isUndefinedOrEmpty(data.storyline))
        game.storyline = data.storyline
    if (!isUndefinedOrEmpty(data.summary))
        game.summary = data.summary
    if (!isUndefinedOrEmpty(data.url))
        game.url = data.url

    return game;
};

exports.reducePlatformDetails = data => {
    let platform = {};

    if (!isUndefinedOrEmpty(data.imageUri))
        platform.imageUri = data.imageUri;
    if (!isUndefinedOrEmpty(data.name))
        platform.name = data.name;
    if (!isUndefinedOrEmpty(data.color))
        platform.color = data.color;

    return platform;
};

