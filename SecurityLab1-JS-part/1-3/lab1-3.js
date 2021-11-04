const fs = require('fs')

const BASE_AMOUNT_OF_POPULATIONS = 500;
const ALPHABET = 'ABCDEFGHILMNOPQRSTUVZ'
const COUNT_OF_TOP_POPULATION = 50;
const ENCRYPTED_TEXT = fs.readFileSync('./text3.txt').toString();
const PROBABILITY_OF_MUTATION = 5;
const AMOUNT_OF_ITERATION = 1000;

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
    return Math.floor(Math.random() * (max - min) + min);
}

const initMapping = (amount) => {
    const results = [];
    for (let j = 0; j < amount; j++) {
        const baseSet = ALPHABET.split('');
        const result = {};
        for (let i = 0; i < ALPHABET.length; i++) {
            if (result.hasOwnProperty(ALPHABET[i])) continue;
            const randomNumber = getRandomNumber(0, baseSet.length - 1)
            const randomLetter = baseSet[randomNumber];
            result[ALPHABET[i]] = randomLetter
            result[randomLetter] = ALPHABET[i]
            baseSet.splice(randomNumber, 1);
            const potentialIndex = baseSet.indexOf(ALPHABET[i])
            if (potentialIndex !== -1) {
                baseSet.splice(potentialIndex, 1)
            }
        }
        results.push(result)
    }
    return results
}

const decode = (cipheredText, key) => {
    const resultText = [];
    cipheredText.split('').forEach(char => {
        resultText.push(key[char]);
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

const getTwoRandomNumbers = (min = 0, max = ALPHABET.length - 1) => {
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

const crossover = (firstChromo, secondChromo) => {
    const newChromo = {};
    let count = 0;
    for (let char in firstChromo) {
        if (count < Object.keys(firstChromo).length) {
            newChromo[char] = firstChromo[char]
        } else {
            newChromo[char] = secondChromo[char]
        }
        count++;
    }
    const scoreBeforeMutation = calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT);
    let scoreAfterMutation = 0;
    const randomNumber = Math.floor(Math.random() * 100);
    if (randomNumber <= PROBABILITY_OF_MUTATION) {
        const newMutatedChromo = {...newChromo}
        const {firstNumber, secondNumber} = getTwoRandomNumbers();
        const firstLetter = ALPHABET[firstNumber];
        const secondLetter = ALPHABET[secondNumber];
        newMutatedChromo[firstLetter] = newChromo[secondLetter];
        newMutatedChromo[secondLetter] = newChromo[firstLetter];
        scoreAfterMutation = calculateScore(decode(ENCRYPTED_TEXT, newMutatedChromo), REF_BIGRAMED_TEXT);
        if (scoreAfterMutation > scoreBeforeMutation) {
            return newMutatedChromo
        }
    }
    return newChromo
}

const generate = (populations) => {
    const newPopulations = [...populations];
    const {firstNumber, secondNumber} = getTwoRandomNumbers(0, populations.length - 1);
    const newChromo = crossover(populations[firstNumber], populations[secondNumber]);
    const { topPopulations: [theWorst] } = select(newPopulations, false, 1);
    const theWorstIndex = newPopulations.findIndex(x => JSON.stringify(x) === JSON.stringify(theWorst))
    if (calculateScore(decode(ENCRYPTED_TEXT, theWorst), REF_BIGRAMED_TEXT) < calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT)) {
        newPopulations[theWorstIndex] = newChromo;
    }
    return newPopulations
}

const main = () => {
    const initPopulation = initMapping(BASE_AMOUNT_OF_POPULATIONS);
    let result = initPopulation;
    for (let i = 0; i < AMOUNT_OF_ITERATION; i++) {
        console.log(i)
        result = [...generate(result)]
    }
    const {topPopulations} = select(result, true, COUNT_OF_TOP_POPULATION);
    for (let i = 0; i < topPopulations.length; i++) {
        fs.appendFileSync('./result.txt', topPopulations[i]);
        fs.appendFileSync('./result.txt', '\n------------------------------\n');
    }
}

main()