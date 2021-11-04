const fs = require('fs');
const {
    randomInt
} = require('crypto');

const BASE_AMOUNT_OF_POPULATIONS = 500;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
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

// def update_mapping(mapping, char, repl):
// # Update the solution by switching `char` with `repl`
//     # and `repl` with `char`.
//     current_repl = mapping[char]
//     current_char = mapping[repl]
//
// if current_char == repl:
// current_char = current_repl
// elif current_repl == char:
// current_repl = current_char
//
// mapping[current_char] = current_repl
// mapping[current_repl] = current_char
//
// mapping[char] = repl
// mapping[repl] = char

const updateChromo = (chromo, char, repl) => {
    let currentRepl = chromo[char];
    let currentChar = chromo[repl];

    if (currentChar === repl) {
        currentChar = currentRepl;
    } else if (currentRepl === char) {
        currentRepl = currentChar;
    }

    chromo[currentChar] = currentRepl;
    chromo[currentRepl] = currentChar;

    chromo[char] = repl;
    chromo[repl] = char;

    return chromo
}

const crossover = (firstChromo, secondChromo) => {
    let newChromo = {...firstChromo};
    let count = 0;
    for (let char in firstChromo) {
        if (count % 2 !== 0) {
            newChromo = updateChromo(newChromo, char, secondChromo[char])
        }
        count++;
    }
    const scoreBeforeMutation = calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT);
    let scoreAfterMutation = 0;
    const randomNumber = Math.floor(Math.random() * 100);
    if (randomNumber <= PROBABILITY_OF_MUTATION) {
        const {firstNumber, secondNumber} = getTwoRandomNumbers();
        const firstLetter = ALPHABET[firstNumber];
        const secondLetter = ALPHABET[secondNumber];
        console.log(firstLetter);
        console.log(secondLetter)
        const newMutatedChromo = updateChromo(newChromo, firstLetter, secondLetter)
        console.log(newChromo)
        console.log(newMutatedChromo)
        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
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
    const { topPopulations: [theWorst], topScore: theWorstScore } = select(newPopulations, false, 1);
    console.log(theWorstScore)
    const theWorstIndex = newPopulations.findIndex(x => JSON.stringify(x) === JSON.stringify(theWorst))
    if (theWorstScore < calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT))  {
        newPopulations[theWorstIndex] = newChromo;
        if (topScore < calculateScore(decode(ENCRYPTED_TEXT, newChromo), REF_BIGRAMED_TEXT)) {
            console.log('AAAAAAAAAA')
            console.log(newChromo)
        }
    }
    return newPopulations
}

let result = initMapping(BASE_AMOUNT_OF_POPULATIONS);
const {topScore} = select(result, true, 1);
console.log(topScore)
for (let i = 0; i < AMOUNT_OF_ITERATION; i++) {
    console.log(i)
    result = [...generate(result)]
}
const {topPopulations} = select(result, true, COUNT_OF_TOP_POPULATION);
let text = '';
for (let i = 0; i < topPopulations.length; i++) {
    text += decode(ENCRYPTED_TEXT, topPopulations[i]);
    text += '\n------------------------------\n';
}
fs.writeFileSync('./result.txt', text);