'use strict';

const fs = require('fs');
const {getTwoRandomNumbers, getRandomNumber, swap, getCountRandomNumber} = require('../utils/geneticUtils');

class GeneticAlgoForPolyalphabetic {
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
    IS_ASC;
    GROUPED_TEXT;

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
        this.IS_ASC = config.isAsc ?? true;
        this.GROUPED_TEXT = config.groupedText;
    }

    generateSeed(text) {
        const scores = {};
        this.ALPHABET.split('').forEach(char => {
            scores[char] = 0;
        })
        text.forEach(char => {
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
            const chromo = {}
            this.GROUPED_TEXT.forEach((group, index) => {
                chromo[index] = this.generateSeed(group);
            })
            results.push(chromo);
        }
        for (let j = results.length; j < amount; j++) {
            const chromo = {};
            for (let i = 0; i < this.GROUPED_TEXT.length; i++) {
                const baseSet = this.ALPHABET.split('');
                const result = {};
                for (let k = 0; k < this.ALPHABET.length; k++) {
                    if (result.hasOwnProperty(this.ALPHABET[k])) continue;
                    const randomNumber = getRandomNumber(0, baseSet.length)
                    result[this.ALPHABET[k]] = baseSet[randomNumber]
                    baseSet.splice(randomNumber, 1);
                }
                chromo[i] = result;
            }
            results.push(chromo);
        }
        return results
    }

    decode(chromo) {
        const chromoCopy = {...chromo};
        const resultText = [];
        for (let group in chromoCopy) {
            chromoCopy[group] = swap(chromoCopy[group]);
        }
        this.ENCRYPTED_TEXT.split('').forEach((char, index) => {
            resultText.push(chromoCopy[index % Object.keys(chromoCopy).length][char])
        })
        return resultText.join('');
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
        for (let quadGram in ngramingText) {
            if (quadGram.length !== 4) continue;
            const value = this.REF_NGRAMED_TEXT[quadGram.toLowerCase()]
            if (value) {
                totalSum += value * ngramingText[quadGram];
            } else {
                totalSum += (-10) * ngramingText[quadGram];
            }
        }
        return totalSum;
    }

    select(population, isAsc) {
        const scores = []
        population.forEach(chromo => {
            const decodedText = this.decode(chromo);
            const score = this.calculateScore(decodedText)
            scores.push([chromo, score]);
        })
        const sortedPopulation = scores.sort((a, b) => isAsc ? b[1] - a[1] : a[1] - b[1])
        return {
            topScore: sortedPopulation[0][1],
            topPopulations: sortedPopulation.map(el => el[0])
        }
    }

    tournament(population) {
        const {topPopulations: sortedPopulation} = this.select(population, this.IS_ASC);
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
        const randomNumber = getRandomNumber(0, Object.keys(newChromo).length);
        const newAlphabet = {...chromo[randomNumber]}
        for (let i = 0; i < count; i++) {
            const {firstNumber, secondNumber} = getTwoRandomNumbers();
            const firstLetter = this.ALPHABET[firstNumber];
            const secondLetter = this.ALPHABET[secondNumber];
            const temp = newAlphabet[firstLetter];
            newAlphabet[firstLetter] = newAlphabet[secondLetter];
            newAlphabet[secondLetter] = temp;
        }
        newChromo[randomNumber] = newAlphabet;
        return newChromo
    }

    crossover(firstChromo, secondChromo) {
        const newChromo = {...firstChromo};
        const {firstNumber, secondNumber} = getTwoRandomNumbers(0, Object.keys(firstChromo).length);
        newChromo[secondNumber] = secondChromo[secondNumber];
        const newAlphabet = {};
        let counter = 0;
        const listKey = [];
        const listValue = this.ALPHABET.split('');
        const randomPointOfCrossovering = getRandomNumber(0, this.ALPHABET.length);
        for (let char in firstChromo[firstNumber]) {
            if (counter > randomPointOfCrossovering) {
                listKey.push(char);
            } else {
                newAlphabet[char] = firstChromo[firstNumber][char];
                listValue.splice(listValue.indexOf(firstChromo[firstNumber][char]), 1);
            }
            counter++;
        }
        const newListKey = [];
        listKey.forEach(char => {
            const value = secondChromo[firstNumber][char];
            if (!Object.values(newAlphabet).includes(value) && !Object.keys(newAlphabet).includes(char)) {
                newAlphabet[char] = value;
                listValue.splice(listValue.indexOf(value), 1);
            } else {
                newListKey.push(char)
            }
        });
        for (let i = 0; i < newListKey.length; i++) {
            newAlphabet[newListKey[i]] = listValue[i];
        }
        newChromo[firstNumber] = newAlphabet;

        const scoreBeforeMutation = this.calculateScore(this.decode(newChromo));
        const randomNumber2 = Math.floor(Math.random() * 100);
        if (randomNumber2 <= this.PROBABILITY_OF_MUTATION) {
            const newMutatedChromo = this.mutation(newChromo, 3);
            const scoreAfterMutation = this.calculateScore(this.decode(newMutatedChromo));
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
        let bestResult = (this.select(result, this.IS_ASC)).topScore;
        for (let i = 0; i < this.AMOUNT_OF_ITERATION && counter < this.STABILITY_INTERVALS; i++) {
            console.log(i)
            const elita = this.select(result, this.IS_ASC);
            // if (elita.topScore > -5800) {
            //     return result
            // }
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
        return (this.select(result, true)).topPopulations.slice(0, this.TOP_RESULTS);
    }

    writeDecryptedTextToTheFile(population, i) {
        let text = '';
        for (let i = 0; i < population.length; i++) {
            const decryptedText = this.decode(population[i]);
            text += decryptedText
            text += '\n------------------------------\n';
        }
        fs.writeFileSync(`./result-${i}-${Math.random()}.txt`, text);
    }
}

module.exports = {
    GeneticAlgoForPolyalphabetic
}