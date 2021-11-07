'use strict';

const fs = require('fs');
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

class GeneticAlgo {
    ENCRYPTED_TEXT;
    AMOUNT_OF_ITERATION;
    REF_NGRAMED_TEXT;
    PROBABILITY_OF_WINING;
    POPULATION_SIZE;
    ALPHABET;
    FREQUENCY_TABLE;
    PROBABILITY_OF_MUTATION;
    PATH_RESULT;
    ELITISM;
    TOURNAMENT_SIZE;
    TOP_RESULTS;
    STABILITY_INTERVALS;

    constructor(config) {
        this.ENCRYPTED_TEXT = config.encryptedText;
        this.AMOUNT_OF_ITERATION = config.amountOfIteration;
        this.REF_NGRAMED_TEXT = config.refNgramedText;
        this.PROBABILITY_OF_WINING = config.probabilityOfWining;
        this.POPULATION_SIZE = config.populationSize;
        this.ALPHABET = config.alphabet;
        this.FREQUENCY_TABLE = config.frequencyTable;
        this.PROBABILITY_OF_MUTATION = config.probabilityOfMutation;
        this.PATH_RESULT = config.pathResult;
        this.ELITISM = config.elitism;
        this.TOURNAMENT_SIZE = config.tournamentSize;
        this.TOP_RESULTS = config.topResults;
        this.STABILITY_INTERVALS = config.stabilityInterval;
    }

    generateSeed() {
        const scores = {};
        this.ALPHABET.split('').forEach(char => {
            scores[char] = 0;
        })
        this.ENCRYPTED_TEXT.split('').forEach(char => {
            scores[char]++;
        })
        const sortedResult = Object.fromEntries(
            Object.entries(scores).sort(([, a], [, b]) => a - b)
        );
        const sortedFrequencyTable = Object.fromEntries(
            Object.entries(this.FREQUENCY_TABLE).sort(([, a], [, b]) => a - b)
        );
        const resultKeys = Object.keys(sortedResult);
        const frequencyKeys = Object.keys(sortedFrequencyTable);
        const result = {};
        for (let i = 0; i < resultKeys.length; i++) {
            result[resultKeys[i].toUpperCase()] = frequencyKeys[i].toUpperCase();
        }
        return result;
    }

    initMapping(amount, isStart = false) {
        const results = [];
        if (isStart) {
            results.push(this.generateSeed())
        }
        for (let j = results.length; j < amount; j++) {
            const baseSet = this.ALPHABET.split('');
            const result = {};
            for (let i = 0; i < this.ALPHABET.length; i++) {
                if (result.hasOwnProperty(this.ALPHABET[i])) continue;
                const randomNumber = getRandomNumber(0, baseSet.length)
                result[this.ALPHABET[i]] = baseSet[randomNumber]
                baseSet.splice(randomNumber, 1);
            }
            results.push(result)
        }
        return results
    }

    decode(cipheredText, key) {
        const resultText = [];
        const decodedKey = swap(key);
        cipheredText.split('').forEach(char => {
            resultText.push(decodedKey[char]);
        })
        return resultText.join('')
    }

    select(population, isAsc) {
        const scores = []
        population.forEach(chromo => {
            const decodedText = this.decode(this.ENCRYPTED_TEXT, chromo);
            const score = this.calculateScore(decodedText, this.REF_NGRAMED_TEXT)
            scores.push([chromo, score]);
        })
        const sortedPopulation = scores.sort((a, b) => isAsc ? b[1] - a[1] : a[1] - b[1])
        return {
            topScore: sortedPopulation[0][1],
            topPopulations: sortedPopulation.map(el => el[0])
        }
    }

    tournament(population) {
        const {topPopulations: sortedPopulation} = this.select(population, true);
        const randomNumber = getRandomNumber(0, 1E+15) / 1E+15;
        let total = 0;
        for (let i = population.length - 1; i >= 0; i--) {
            total += this.PROBABILITY_OF_WINING * (1 - this.PROBABILITY_OF_WINING) ** i;
            if (randomNumber < total) {
                return sortedPopulation[i]
            }
        }
        return sortedPopulation[0];
    }

    mutation(chromo, count) {
        const newChromo = {...chromo};
        for (let i = 0; i < count; i++) {
            const {firstNumber, secondNumber} = getTwoRandomNumbers();
            const firstLetter = this.ALPHABET[firstNumber];
            const secondLetter = this.ALPHABET[secondNumber];
            const temp = newChromo[firstLetter];
            newChromo[firstLetter] = newChromo[secondLetter];
            newChromo[secondLetter] = temp;
        }
        return newChromo
    }

    crossover(firstChromo, secondChromo) {
        const newChromo = {};
        let counter = 0;
        const listKey = [];
        const listValue = this.ALPHABET.split('');
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

        const scoreBeforeMutation = this.calculateScore(this.decode(this.ENCRYPTED_TEXT, newChromo), this.REF_NGRAMED_TEXT);
        let scoreAfterMutation = 0;
        const randomNumber = Math.floor(Math.random() * 100);
        if (randomNumber <= this.PROBABILITY_OF_MUTATION) {
            const newMutatedChromo = this.mutation(newChromo, 3);
            scoreAfterMutation = this.calculateScore(this.decode(this.ENCRYPTED_TEXT, newMutatedChromo), this.REF_NGRAMED_TEXT);
            if (scoreAfterMutation > scoreBeforeMutation) {
                return newMutatedChromo
            }
        }
        return newChromo
    }

    generate(winers, reserved) {
        const newPopulation = [...reserved];
        winers.forEach(winer => {
            if (newPopulation.findIndex(chromo => JSON.stringify(chromo) === JSON.stringify(winer)) === -1) {
                newPopulation.push(winer)
            }
        });
        for (let i = 0; i < winers.length; i++) {
            for (let j = i + 1; j < winers.length; j++) {
                if (newPopulation.length < this.POPULATION_SIZE) {
                    newPopulation.push(this.crossover(winers[i], winers[j]))
                }
                if (newPopulation.length < this.POPULATION_SIZE) {
                    newPopulation.push(this.crossover(winers[j], winers[i]))
                }
            }
        }
        for (let i = newPopulation.length; i < this.POPULATION_SIZE; i++) {
            newPopulation.push(this.initMapping(1)[0])
        }
        return newPopulation;
    }

    splitForGroups(population) {
        const groups = [];
        for (let i = 0; i < this.TOURNAMENT_SIZE; i++) {
            const group = [];
            for (let i = 0; i < this.POPULATION_SIZE / this.TOURNAMENT_SIZE; i++) {
                const randomNumber = getRandomNumber(0, population.length);
                group.push(population[randomNumber]);
                population.splice(randomNumber, 1);
            }
            groups.push(group);
        }
        return groups;
    }

    findAnswer() {
        let result = this.initMapping(this.POPULATION_SIZE, true);
        let counter = 0;
        let bestResult = (this.select(result, true)).topScore;
        for (let i = 0; i < this.AMOUNT_OF_ITERATION && counter < this.STABILITY_INTERVALS; i++) {
            console.log(i)
            const elita = this.select(result, true);
            console.log(elita.topScore)
            if (bestResult === elita.topScore) {
                counter++;
            } else {
                bestResult = elita.topScore;
                counter = 0;
            }
            const reserved = elita.topPopulations.slice(0, this.POPULATION_SIZE * this.ELITISM);
            const groups = this.splitForGroups(result);
            const winers = groups.map(group => this.tournament(group));
            result = this.generate(winers, reserved);
        }
        return result
    }

    writeDecryptedTextToTheFile(population) {
        let text = '';
        const {topPopulations} = this.select(population, true);
        for (let i = 0; i < this.TOP_RESULTS; i++) {
            text += this.decode(this.ENCRYPTED_TEXT, topPopulations[i]);
            text += '\n------------------------------\n';
        }
        fs.writeFileSync(this.PATH_RESULT, text);
    }
}

class GeneticAlgoForMonoAlphabet extends GeneticAlgo {
    constructor(config) {
        super(config);
    }

    ngramingText(text) {
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

    calculateScore(decryptedText) {
        const ngramingText = this.ngramingText(decryptedText);
        let totalSum = 0;
        for (let bigram in ngramingText) {
            if (bigram.length !== 4) continue;
            const value = this.REF_NGRAMED_TEXT[bigram.toLowerCase()]
            if (value) {
                totalSum += value;
            } else {
                totalSum += (-10)
            }
        }
        return totalSum;
    }

}

module.exports = {
    GeneticAlgo,
    GeneticAlgoForMonoAlphabet
};