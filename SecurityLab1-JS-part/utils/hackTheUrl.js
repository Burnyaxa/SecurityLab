const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const axios = require('axios');
const fs = require('fs');

const smallAlphabet = ALPHABET.toLowerCase();

//https://bit.ly/3xCQIxB

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const bla = async () => {
    const results = [];
    for (let i1 = 20; i1 < smallAlphabet.length; i1++) {
        for (let i2 = 0; i2 < ALPHABET.length; i2++) {
            const url = `https://bit.ly/3lC${ALPHABET[i1]}I${smallAlphabet[i2]}B`;
            await sleep(1000);
            fetch.get(url)
                .then(function (response) {
                    // handle success
                    results.push(url)
                    console.log(url)
                })
                .catch(function (error) {
                    console.log(error.response.status);
                });
        }
    }
    fs.writeFileSync('./blabla.txt', JSON.stringify(results));
}

bla()