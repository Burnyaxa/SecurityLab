const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
} = require('worker_threads');
const fs = require('fs');
const { PolyAlphabetCipherSolver } = require('./Solver');

if (isMainThread) {
    module.exports = () =>
        new Promise((resolve, reject) => {
            for (let i = 0; i < 4; i++) {
                const worker = new Worker(__filename, {
                    workerData: i,
                });
                worker.on('message', resolve);
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            }
        });
} else {
    for (let j = 0; j < 10; j++) {
        const solver = new PolyAlphabetCipherSolver({
            encryptedText: fs.readFileSync('./text4.txt').toString(),
            refNgramedText: JSON.parse(fs.readFileSync('../1-3/quad_scores.json').toString()),
            pathResult: `./result4-${j}-${workerData}-${Math.random()}.txt`
        })
        solver.run();
    }
    process.exit(0);
}