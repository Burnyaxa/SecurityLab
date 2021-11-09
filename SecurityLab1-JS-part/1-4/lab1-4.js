'use strict';

const fs = require('fs')
const { PolyAlphabetCipherSolver }  = require('./Solver');

const uploadRefBigramPairs = (path) => {
    const data = JSON.parse(fs.readFileSync(path).toString());
    const result = {}
    data.forEach(bigram => {
        result[bigram[0]] = bigram[1];
    })
    return result;
}

const main = async () => {
    const solver = new PolyAlphabetCipherSolver({
        encryptedText: fs.readFileSync('./text4.txt').toString(),
        refNgramedText: JSON.parse(fs.readFileSync('../1-3/quad_scores.json').toString()),
        pathResult: `./result4.txt`
    })
    solver.run();
}


main();
