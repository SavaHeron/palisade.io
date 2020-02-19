const crypto = require('crypto');

let auth = `password`;

crypto.pbkdf2(auth, 'zokowrAprIxuhlswUKU6oMAqiho0ichoge4obRaCuT3xachudrehufRAwreprlFe', 100000, 64, 'sha512', (error, derivedKey) => {
    if (error) {
        return console.error(error);
    } else {
        let hashedtoken = derivedKey.toString('hex');
        console.log(hashedtoken);
    };
});
