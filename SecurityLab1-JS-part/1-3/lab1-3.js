const fs = require('fs');
const {
    randomInt
} = require('crypto');

const BASE_AMOUNT_OF_POPULATIONS = 200;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const COUNT_OF_TOP_POPULATION = 50;
const ENCRYPTED_TEXT = fs.readFileSync('./text3.txt').toString();
const PROBABILITY_OF_MUTATION = 70;
const AMOUNT_OF_ITERATION = 8000;
const ANSWER = {
    A: 'E',
    B: 'K',
    C: 'M',
    D: 'F',
    E: 'L',
    F: 'G',
    G: 'D',
    H: 'Q',
    I: 'V',
    J: 'Z',
    K: 'N',
    L: 'T',
    M: 'O',
    N: 'W',
    O: 'Y',
    P: 'H',
    Q: 'X',
    R: 'U',
    S: 'S',
    T: 'P',
    U: 'A',
    V: 'I',
    W: 'B',
    X: 'R',
    Y: 'C',
    Z: 'J',
}

const uploadRefBigramPairs = (path) => {
    const data = JSON.parse(fs.readFileSync(path).toString());
    const result = {}
    data.forEach(bigram => {
        result[bigram[0]] = bigram[1];
    })
    return result;
}
const REF_BIGRAMED_TEXT = uploadRefBigramPairs('./bigrams.json');

function getRandomNumber(min, max) {
    return randomInt(min,max);
}

const initMapping = (amount) => {
    const results = [];
    for (let j = 0; j < amount; j++) {
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

function swap(json){
    var ret = {};
    for(var key in json){
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
    const pairs = text.match(/.{1,2}/g);
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
        if (bigram.length !== 2) continue;
        totalSum += bigramedText[bigram] * refBigramedText[bigram.toLowerCase()]
    }
    return totalSum;
}

const select = (populations, isAsc, numb) => {
    const scores = new Map()
    populations.forEach(chromo => {
        const decodedText = decode(ENCRYPTED_TEXT, chromo);
        const score = calculateScore(decodedText, REF_BIGRAMED_TEXT)
        scores.set(chromo, score)
    })
    const sortedPopulations = new Map([...scores.entries()].sort((a, b) => isAsc ? b[1] - a[1] : a[1] - b[1]));
    const topPopulations = [];
    let topScore = 0;
    const sortedMapPopulationsIterator = sortedPopulations.entries();
    for (let i = 0; i < numb; i++) {
        const populationAndScore = sortedMapPopulationsIterator.next().value;
        if (i === 0) {
            topScore = populationAndScore[1];
        }
        topPopulations.push(populationAndScore[0])
    }

    return {
        topScore,
        topPopulations
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
    const newChromo = { ...chromo };
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
    let better;
    let worth;
    if (calculateScore(decode(ENCRYPTED_TEXT,firstChromo), REF_BIGRAMED_TEXT) > calculateScore(decode(ENCRYPTED_TEXT, secondChromo), REF_BIGRAMED_TEXT)) {
        better = firstChromo;
        worth = secondChromo;
    } else {
        better = secondChromo;
        worth = firstChromo;
    }
    const newChromo = {};
    let counter = 0;
    const listKey = [];
    const listValue = ALPHABET.split('');
    for (let char in better) {
        if (counter > 16) {
            listKey.push(char);
        } else {
            newChromo[char] = better[char];
            listValue.splice(listValue.indexOf(better[char]), 1);
        }
        counter++;
    }
    const newListKey = [];
    listKey.forEach(char => {
        const value = worth[char];
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

const generate = (populations) => {
    const newPopulations = [...populations];
    const {firstNumber, secondNumber} = getTwoRandomNumbers(0, populations.length);
    const newChromo = crossover(populations[firstNumber], populations[secondNumber]);
    const { topPopulations: [theWorst], topScore: theWorstScore } = select(newPopulations, false, 1);
    console.log(theWorstScore)
    const theWorstIndex = newPopulations.findIndex(x => JSON.stringify(x) === JSON.stringify(theWorst))
    if (theWorstScore < calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT))  {
        newPopulations[theWorstIndex] = newChromo;
    }
    return {newPopulations, theWorstScore}
}

// const mutation = (population) => {
//     const newPopulation = [...population];
//     for (let i = 0; i < population.length * PROBABILITY_OF_MUTATION; i++) {
//         const chromo = population[getRandomNumber(0, population.length)];
//         const scoreBeforeMutation = calculateScore(decode(ENCRYPTED_TEXT, chromo), REF_BIGRAMED_TEXT);
//         const {firstNumber, secondNumber} = getTwoRandomNumbers();
//         const firstLetter = ALPHABET[firstNumber];
//         const secondLetter = ALPHABET[secondNumber];
//         const mutatedChromo = updateChromo({ ...chromo }, firstLetter, secondLetter)
//         const scoreAfterMutation = calculateScore(decode(ENCRYPTED_TEXT, mutatedChromo), REF_BIGRAMED_TEXT);
//         if (scoreAfterMutation > scoreBeforeMutation) {
//             return mutatedChromo
//         }
//     }
//     return newPopulation
// }

let result = initMapping(BASE_AMOUNT_OF_POPULATIONS);
let {topScore} = select(result, true, 1);
for (let i = 0; i < AMOUNT_OF_ITERATION; i++) {
    console.log(i);
    const generated = generate(result)
    result = [...generated.newPopulations];
    if (generated.theWorstScore > 6350000000000) {
        break;
    }
}
const {topPopulations} = select(result, true, COUNT_OF_TOP_POPULATION);
console.log(topPopulations[0])
let text = '';
for (let i = 0; i < topPopulations.length; i++) {
    text += decode(ENCRYPTED_TEXT, topPopulations[i]);
    text += '\n------------------------------\n';
}
fs.writeFileSync('./result.txt', text);
