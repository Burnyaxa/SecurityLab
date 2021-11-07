const fs = require('fs');
const { GeneticAlgoForMonoAlphabet } = require('./geneticAlgo');
const { ALPHABET, ENGLISH_FREQUENCY_TABLE } = require('./constants');
// const uploadRefBigramPairs = (path) => {
//     const data = JSON.parse(fs.readFileSync(path).toString());
//     const result = {}
//     data.forEach(bigram => {
//         result[bigram[0]] = bigram[1];
//     })
//     return result;
// }

const main = () => {
    const encryptedText = fs.readFileSync('./text3.txt').toString();
    const algo = new GeneticAlgoForMonoAlphabet({
        encryptedText,
        refNgramedText: JSON.parse(fs.readFileSync('./quad_scores.json').toString()),
        amountOfIteration: 200,
        probabilityOfWining: 0.75,
        populationSize: 500,
        alphabet: ALPHABET,
        frequencyTable: ENGLISH_FREQUENCY_TABLE,
        probabilityOfMutation: 95,
        pathResult: './result.txt',
        elitism: 0.15,
        tournamentSize: 20,
        topResults: 50
    })
    const results = algo.findAnswer();
    algo.writeDecryptedTextToTheFile(results);
}

main();

module.exports = {
    ENGLISH_FREQUENCY_TABLE,
    ALPHABET
}
