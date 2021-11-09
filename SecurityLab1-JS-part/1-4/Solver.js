const fs = require('fs');
const { GeneticAlgoForMonoAlphabet, GeneticAlgoForPolyAlphabet } = require('../1-3/geneticAlgo');
const {ENGLISH_FREQUENCY_TABLE, ALPHABET} = require('../utils/constants');
const { GeneticAlgoForPolyalphabetic } = require('./GeneticAlgo');

class PolyAlphabetCipherSolver {
    ENCRYPTED_TEXT;
    PATH_RESULT;
    REF_NGRAMED_TEXT;
    FREQUENCY_TABLE;

    constructor(config) {
        this.ENCRYPTED_TEXT = config.encryptedText;
        this.PATH_RESULT = config.pathResult;
        this.REF_NGRAMED_TEXT = config.refNgramedText;
        this.FREQUENCY_TABLE = ENGLISH_FREQUENCY_TABLE;
    }

    getGroupedBytes(keyLength) {
        const result = [];
        for (let i = 0; i < keyLength; i++) {
            let currentIndex = i;
            const buffer = [];
            while (currentIndex < this.ENCRYPTED_TEXT.length) {
                buffer.push(this.ENCRYPTED_TEXT[currentIndex]);
                currentIndex += keyLength;
            }
            result.push(buffer);
        }
        return result;
    }

    getKeys(indexesOfCoincidences) {
        const result = [];
        for (let length in indexesOfCoincidences) {
            let total = 0;
            const countOfCoincidences = Object.keys(indexesOfCoincidences).length
            for (let i = 0; i < countOfCoincidences; i++) {
                if (i % parseInt(length, 10) === 0) {
                    total += indexesOfCoincidences[length]
                }
            }

            const average = total / (countOfCoincidences / parseInt(length, 10))
            if (average >= 0.06) {
                result.push(parseInt(length, 10) + 1)
            }
        }
        return result;
    }

    calculateIndexOfCoincidences() {
        const buffer = this.ENCRYPTED_TEXT.split('');
        const result = {};
        for (let i = 0; i < this.ENCRYPTED_TEXT.length - 1; i++) {
            const ch = buffer[buffer.length - 1];
            buffer.splice(buffer.length - 1, 1)
            buffer.unshift(ch);
            let counter = 0;
            for (let j = 0; j < this.ENCRYPTED_TEXT.length - 1; j++) {
                if (this.ENCRYPTED_TEXT[j] === buffer[j]) {
                    counter++;
                }
            }
            result[i] = counter / this.ENCRYPTED_TEXT.length;
        }
        return result
    }

    concatStrings(groups) {
        const results = [];
        const n = groups.length;
        let indices = [];

        for (let i = 0; i < n; i++) {
            indices[i] = 0;
        }
        while (true) {
            const currentCombination = [];
            for (let i = 0; i < n; i++) {
                currentCombination.push(groups[i][indices[i]]);
            }
            results.push(currentCombination);

            let next = n - 1;
            while (next >= 0 && (indices[next] + 1 >= groups[next].length)) {
                next--;
            }

            if (next < 0) {
                return results;
            }

            indices[next]++;

            for (let i = next + 1; i < n; i++) {
                indices[i] = 0;
            }
        }
    }

    getStrByPossibleAnswers(listsOfList) {
        const result = [];
        listsOfList.forEach(list => {
            const buffer = [];
            for (let i = 0; i < list.length; i++) {
                let insertIndex = i;
                for (let j = 0; j < list[i].length; j++) {
                    buffer.splice(insertIndex + j, 0, list[i][j]);
                    insertIndex += i;
                }
            }
            result.push(buffer.join(''))
        })
        return result
    }

    run() {
        const indexes = this.calculateIndexOfCoincidences();
        const keys = this.getKeys(indexes);
        const groupedText = this.getGroupedBytes(keys[0]);
        const algo = new GeneticAlgoForPolyalphabetic({
            groupedText,
            encryptedText: this.ENCRYPTED_TEXT,
            refNgramedText: this.REF_NGRAMED_TEXT,
            amountOfIteration: 300,
            probabilityOfWining: 0.75,
            populationSize: 500,
            alphabet: ALPHABET,
            frequencyTable: ENGLISH_FREQUENCY_TABLE,
            probabilityOfMutation: 90,
            pathResult: './result.txt',
            elitism: 0.15,
            tournamentSize: 20,
            topResults: 500,
            stabilityInterval: 50,
        });
        const possibleAnswers = algo.findAnswer();
        console.log(possibleAnswers[0])
        algo.writeDecryptedTextToTheFile(possibleAnswers, 10000);
    }
}

module.exports = {
    PolyAlphabetCipherSolver
}

