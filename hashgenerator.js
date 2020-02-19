const crypto = require('crypto');
const fs = require(`fs`);

class tokengen {
    constructor(password) {
        this.auth = password;
    };

    newtoken() {
        crypto.pbkdf2(this.auth, 'zokowrAprIxuhlswUKU6oMAqiho0ichoge4obRaCuT3xachudrehufRAwreprlFe', 100000, 64, 'sha512', (error, derivedKey) => {
            if (error) {
                fs.appendFile(`./logs/error.log`, `${error.stack}\n`, (error) => {      //this logs the error to error.log
                    if (error) {
                        return console.error(error);
                    };
                });
                return console.error(error);
            } else {
                let hashedtoken = derivedKey.toString('hex');
                return hashedtoken;
            };
        });
    };
};

module.exports = tokengen;
