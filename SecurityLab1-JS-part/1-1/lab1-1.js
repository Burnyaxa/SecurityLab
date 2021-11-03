const fs = require('fs')

function SolveXOR(text) {
    const result = [];
    const bytes = [];
    for (let i = 0; i < text.length; i += 2) {
        const byte = parseInt(text.slice(i, i + 2), 16);
        bytes.push(byte);
    }
    for (let i = 0; i < 256; i++) {
        const buffer = [];
        for (let j = 0; j < bytes.length; j++) {
            buffer.push(bytes[j] ^ i);
        }
        result.push(Buffer.from(buffer).toString('utf-8'))
    }
    const filteredResults = []
    result.filter((str) => {
        const result1 = str.split('\n').filter(substr => {
            return substr.match(/^[a-z0-9!"#$%&'()*+,.\/:;“”‘’<=>?@\[\] _`{|}~-]*$/i) !== null
        });
        if (result1.length !== 0) {
            filteredResults.push(result1);
            return true
        }
        return false
    });
    return filteredResults;
}

const encryptedText = fs.readFileSync('./text1.txt')
fs.writeFileSync('result1.txt', SolveXOR(encryptedText).join('\n'));