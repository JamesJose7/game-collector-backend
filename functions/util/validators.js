const isEMail = email => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    return false;
};

const isEmpty = string => {
    if (string.trim() == '') return true;
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

    if (data.imageUri != undefined)
        if (!isEmpty(data.imageUri.trim())) game.imageUri = data.imageUri;
    if (data.isPhysical !== undefined) game.isPhysical = data.isPhysical;
    if (data.name != undefined)
        if (!isEmpty(data.name.trim())) game.name = data.name;
    if (data.shortName != undefined)
        if (!isEmpty(data.shortName.trim())) game.shortName = data.shortName;
    if (data.publisherId != undefined)
        if (!isEmpty(data.publisherId.trim()))
            game.publisherId = data.publisherId;
    if (data.publisher != undefined)
        if (!isEmpty(data.publisher.trim())) game.publisher = data.publisher;
    if (data.timesCompleted !== undefined)
        game.timesCompleted = data.timesCompleted;

    return game;
};

exports.reducePlatformDetails = data => {
    let platform = {};

    if (data.imageUri != undefined)
        if (!isEmpty(data.imageUri.trim())) platform.imageUri = data.imageUri;
    if (data.name != undefined)
        if (!isEmpty(data.name.trim())) platform.name = data.name;
    if (data.color != undefined)
        if (!isEmpty(data.color.trim())) platform.color = data.color;

    return platform;
};

