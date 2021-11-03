const fs = require('fs')

function SolveXOR(text) {
    const result = [];
    const bytes = [];
    for (let i = 0; i < text.length; i += 2) {
        const byte = parseInt(text.slice(i, i + 2), 16);
        bytes.push(byte);
    }
    for (let i = 0; i < 256; i++) {
        result[i] = Buffer.from(bytes.map(byte => byte ^ i)).toString('utf8');
    }
    const results = []
    result.filter((str) => {
        const result1 = str.split('\n').filter(substr => {
            return substr.match(/^[a-z0-9!"#$%&'()*+,.\/:;“”‘’<=>?@\[\] _`{|}~-]*$/i) !== null
        });
        if (result1.length !== 0) {
            results.push(result1);
            return true
        }
        return false
    });
    return results;
}

const encryptedText = fs.readFileSync('./text1.txt')
fs.writeFileSync('result1.txt', SolveXOR(encryptedText).join('\n'));