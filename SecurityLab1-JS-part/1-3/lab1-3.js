const fs = require('fs');

const BASE_AMOUNT_OF_POPULATIONS = 500;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ENCRYPTED_TEXT = fs.readFileSync('./text3.txt').toString();
const PROBABILITY_OF_MUTATION = 95;
const AMOUNT_OF_ITERATION = 200;
const PROBABILITY_OF_WINING = 0.75;
const ELITISM = 0.15;
const NUMBER_OF_GROUPS = 20;

const ENGLISH_FREQUENCY_TABLE = {
    a: 0.08167,
    b: 0.01492,
    c: 0.02782,
    d: 0.04253,
    e: 0.12702,
    f: 0.02228,
    g: 0.02015,
    h: 0.06094,
    i: 0.06966,
    j: 0.00153,
    k: 0.00772,
    l: 0.04025,
    m: 0.02406,
    n: 0.06749,
    o: 0.07507,
    p: 0.01929,
    q: 0.00095,
    r: 0.05987,
    s: 0.06327,
    t: 0.09056,
    u: 0.02758,
    v: 0.00978,
    w: 0.02360,
    x: 0.00150,
    y: 0.01974,
    z: 0.00074
}

const uploadRefBigramPairs = (path) => {
    const data = JSON.parse(fs.readFileSync(path).toString());
    const result = {}
    data.forEach(bigram => {
        result[bigram[0]] = bigram[1];
    })
    return result;
}
// const REF_BIGRAMED_TEXT = uploadRefBigramPairs('./bigrams.json');
const REF_BIGRAMED_TEXT = JSON.parse(fs.readFileSync('./quad_scores.json').toString());

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomDecimalNumber(min, max) {
    return Math.random() * (max - min) + min;
}

const generateSeed = () => {
    const scores = {};
    ALPHABET.split('').forEach(char => {
        scores[char] = 0;
    })
    ENCRYPTED_TEXT.split('').forEach(char => {
        scores[char]++;
    })
    const sortedResult = Object.fromEntries(
        Object.entries(scores).sort(([,a],[,b]) => a-b)
    );
    const sortedFrequencyTable = Object.fromEntries(
        Object.entries(ENGLISH_FREQUENCY_TABLE).sort(([,a],[,b]) => a-b)
    );
    const resultKeys = Object.keys(sortedResult);
    const frequencyKeys = Object.keys(sortedFrequencyTable);
    const result = {};
    for (let i = 0; i < resultKeys.length; i++) {
        result[resultKeys[i].toUpperCase()] = frequencyKeys[i].toUpperCase();
    }
    return result;
}

const initMapping = (amount, isStart = false) => {
    const results = [];
    if (isStart) {
        results.push(generateSeed())
    }
    for (let j = results.length; j < amount; j++) {
        const baseSet = ALPHABET.split('');
        const result = {};
        for (let i = 0; i < ALPHABET.length; i++) {
            if (result.hasOwnProperty(ALPHABET[i])) continue;
            const randomNumber = getRandomNumber(0, baseSet.length)
            result[ALPHABET[i]] = baseSet[randomNumber]
            baseSet.splice(randomNumber, 1);
        }
        results.push(result)
    }
    return results
}

function swap(json) {
    var ret = {};
    for (var key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

const decode = (cipheredText, key) => {
    const resultText = [];
    const decodedKey = swap(key);
    cipheredText.split('').forEach(char => {
        resultText.push(decodedKey[char]);
    })
    return resultText.join('')
}

const bigramingText = (text) => {
    const pairs = [];
    for (let i = 0; i < text.length - 3; i++) {
        pairs.push(text.substring(i, i + 4))
    }
    const result = {};
    pairs.forEach(pair => {
        if (result.hasOwnProperty(pair)) {
            result[pair]++
        } else {
            result[pair] = 1;
        }
    })

    return result;
}

const calculateScore = (decodedText, refBigramedText) => {
    const bigramedText = bigramingText(decodedText);
    let totalSum = 0;
    for (bigram in bigramedText) {
        if (bigram.length !== 4) continue;
        const value = refBigramedText[bigram.toLowerCase()]
        if (value) {
            totalSum += value;
        } else {
            totalSum += (-10)
        }
    }
    return totalSum;
}

const select = (populations, isAsc) => {
    const scores = []
    populations.forEach(chromo => {
        const decodedText = decode(ENCRYPTED_TEXT, chromo);
        const score = calculateScore(decodedText, REF_BIGRAMED_TEXT)
        scores.push([chromo, score]);
    })
    const sortedPopulation = scores.sort((a, b) => isAsc ? b[1] - a[1] : a[1] - b[1])
    return {
        topScore: sortedPopulation[0][1],
        topPopulations: sortedPopulation.map(el => el[0])
    }

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

const mutation = (chromo, count) => {
    const newChromo = {...chromo};
    for (let i = 0; i < count; i++) {
        const {firstNumber, secondNumber} = getTwoRandomNumbers();
        const firstLetter = ALPHABET[firstNumber];
        const secondLetter = ALPHABET[secondNumber];
        const temp = newChromo[firstLetter];
        newChromo[firstLetter] = newChromo[secondLetter];
        newChromo[secondLetter] = temp;
    }
    return newChromo
}

const crossover = (firstChromo, secondChromo) => {
    const newChromo = {};
    let counter = 0;
    const listKey = [];
    const listValue = ALPHABET.split('');
    for (let char in firstChromo) {
        if (counter > 16) {
            listKey.push(char);
        } else {
            newChromo[char] = firstChromo[char];
            listValue.splice(listValue.indexOf(firstChromo[char]), 1);
        }
        counter++;
    }
    const newListKey = [];
    listKey.forEach(char => {
        const value = secondChromo[char];
        if (!Object.values(newChromo).includes(value) && !Object.keys(newChromo).includes(char)) {
            newChromo[char] = value;
            listValue.splice(listValue.indexOf(value), 1);
        } else {
            newListKey.push(char)
        }
    });
    for (let i = 0; i < newListKey.length; i++) {
        newChromo[newListKey[i]] = listValue[i];
    }

    const scoreBeforeMutation = calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT);
    let scoreAfterMutation = 0;
    const randomNumber = Math.floor(Math.random() * 100);
    if (randomNumber <= PROBABILITY_OF_MUTATION) {
        const newMutatedChromo = mutation(newChromo, 3);
        scoreAfterMutation = calculateScore(decode(ENCRYPTED_TEXT, newMutatedChromo), REF_BIGRAMED_TEXT);
        if (scoreAfterMutation > scoreBeforeMutation) {
            return newMutatedChromo
        }
    }
    return newChromo
}

const generate = (winers, reserved) => {
    const newPopulation = [...reserved];
    winers.forEach(winer => {
        if (newPopulation.findIndex(chromo => JSON.stringify(chromo) === JSON.stringify(winer)) === -1) {
            newPopulation.push(winer)
        }
    });
    for (let i = 0; i < winers.length; i++) {
        for (let j = i + 1; j < winers.length; j++) {
            if (newPopulation.length < BASE_AMOUNT_OF_POPULATIONS) {
                newPopulation.push(crossover(winers[i], winers[j]))
            }
            if (newPopulation.length < BASE_AMOUNT_OF_POPULATIONS) {
                newPopulation.push(crossover(winers[j], winers[i]))
            }
        }
    }
    for (let i = newPopulation.length; i < BASE_AMOUNT_OF_POPULATIONS; i++) {
        newPopulation.push(initMapping(1)[0])
    }
    return newPopulation;
}

const tournament = (population) => {
    const {topPopulations: sortedPopulation} = select(population, true);
    const randomNumber = getRandomNumber(0, 1E+15) / 1E+15;
    let total = 0;
    for (let i = population.length - 1; i >= 0; i--) {
        total += PROBABILITY_OF_WINING * (1 - PROBABILITY_OF_WINING) ** i;
        if (randomNumber < total) {
            return sortedPopulation[i]
        }
    }
    return sortedPopulation[0];
}

let result = initMapping(BASE_AMOUNT_OF_POPULATIONS, true);
for (let i = 0; i < AMOUNT_OF_ITERATION; i++) {
    const groups = [];
    const elita = select(result, true);
    const reserved = elita.topPopulations.slice(0, BASE_AMOUNT_OF_POPULATIONS * ELITISM);
    for (let i = 0; i < NUMBER_OF_GROUPS; i++) {
        const group = [];
        for (let i = 0; i < BASE_AMOUNT_OF_POPULATIONS / NUMBER_OF_GROUPS; i++) {
            const randomNumber = getRandomNumber(0, result.length);
            group.push(result[randomNumber]);
            result.splice(randomNumber, 1);
        }
        groups.push(group);
    }
    const winers = groups.map(group => tournament(group));
    result = generate(winers, reserved);
}
let text = '';
for (let i = 0; i < topPopulations.length; i++) {
    text += decode(ENCRYPTED_TEXT, topPopulations[i]);
    text += '\n------------------------------\n';
}
fs.writeFileSync('./result.txt', text);
