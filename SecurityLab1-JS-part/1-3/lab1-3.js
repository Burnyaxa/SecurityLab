const fs = require('fs');
const GeneticAlgo = require('./geneticAlgo');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
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
    const algo = new GeneticAlgo({
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
