'use strict';

const fs = require('fs');
const { GeneticAlgoForPolyAlphabet } = require('../1-3/geneticAlgo');
const { ENGLISH_FREQUENCY_TABLE, ALPHABET } = require('../1-3/constants');

class PolyAlphabetCipherSolver {
    ENCRYPTED_TEXT;
    PATH_RESULT;
    constructor(config) {
        this.ENCRYPTED_TEXT = config.encryptedText;
        this.PATH_RESULT = config.pathResult;
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
                if ( i % parseInt(length, 10) === 0) {
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

    calculateIndexOfCoincidences () {
        const buffer = this.ENCRYPTED_TEXT.split('');
        const result = {};
        for (let i = 0; i < this.ENCRYPTED_TEXT.length - 1; i++) {
            const ch = buffer[buffer.length - 1];
            buffer.splice(buffer.length - 1,1)
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
                    buffer.splice( insertIndex + j, 0, list[i][j] );
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
        const results = [];
        for (let i = 0; i < groupedText.length; i++) {
            console.log(groupedText[i].join(''))
            const algo = new GeneticAlgoForPolyAlphabet({
                encryptedText: groupedText[i].join(''),
                amountOfIteration: 200,
                probabilityOfWining: 0.75,
                populationSize: 500,
                alphabet: ALPHABET,
                frequencyTable: ENGLISH_FREQUENCY_TABLE,
                probabilityOfMutation: 95,
                pathResult: './result.txt',
                elitism: 0.15,
                tournamentSize: 20,
                topResults: 10,
                stabilityInterval: 30,
                isAsc: false,
            });
            const topPopulation = algo.findAnswer();
            const possibleAnswers = [];
            topPopulation.forEach(chromo => {
                const decodedText = GeneticAlgoForPolyAlphabet.decode(groupedText[i].join(''), chromo);
                possibleAnswers.push(decodedText)
            })
            results.push(possibleAnswers);
        }
        const prikol = this.concatStrings(results);
        return this.getStrByPossibleAnswers(prikol)
    }

    writeResultTextToTheFile(answers) {
        let text = '';
        for (let i = 0; i < answers.length; i++) {
            text += answers[i]
            text += '\n------------------------------\n';
        }
        fs.writeFileSync(this.PATH_RESULT, text);
    }
}

const main = () => {
    const solver = new PolyAlphabetCipherSolver({
        encryptedText: fs.readFileSync('./text4.txt').toString(),
        pathResult: './result4.txt'
    })
    const results = solver.run();
    solver.writeResultTextToTheFile(results);
}

main();