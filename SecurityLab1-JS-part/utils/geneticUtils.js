const { ALPHABET } = require('./constants');

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function swap(json) {
    var ret = {};
    for (var key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

const getTwoRandomNumbers = (min = 0, max = ALPHABET.length) => {
    let firstNumber = 0;
    let secondNumber = 0;
    while (firstNumber === secondNumber) {
        firstNumber = getRandomNumber(min, max)
        secondNumber = getRandomNumber(min, max)
    }
    return {
        firstNumber,
        secondNumber
    }
}

const getCountRandomNumber = (min = 0, max, count) => {
    const result = [];
    while (result.length < count) {
        const number = getRandomNumber(min, max);
        if (!result.includes(number)) {
            result.push(number);
        }
    }
    return result;
}

module.exports = {
    getRandomNumber,
    getTwoRandomNumbers,
    swap,
    getCountRandomNumber
}