'use strict';

/*
Name: 		admin.js
Purpose:	A-Level Computer Science coursework admin script
Author:		Sava Max Heron
Created:	21/01/2020
Copyright:	(c) SMH 2020
Licence:	CC BY-NC-ND 4.0
*/

const express = require(`express`);
const fs = require(`fs`);
const async = require(`async`);
const mariadb = require(`mariadb`);
const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);
const sessions = require(`express-session`);
const crypto = require(`crypto`);
const app = express();

const ipregex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;

app.set(`view engine`, `pug`);
app.use(express.static(__dirname + `/public`));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessions({
    secret: `^78skdm£$ss(4wi^&%$`,
    resave: false,
    saveUninitialized: false
}));

class Admin {
    constructor(localip, dbuser, dbpassword) {
        this.dbuser = dbuser;
        this.dbpassword = dbpassword;
        this.localip = localip;
    };

    startserver() {
        let pool = mariadb.createPool({
            host: `localhost`,
            user: this.dbuser,
            password: this.dbpassword,
            connectionLimit: 5,
            database: `palisadeio`
        });

        app.listen(80, this.localip);

        app.get(`/public/css/bootstrap.min.css`, function (_req, resp) {
            resp.sendFile(`./public/css/bootstrap.min.css`, { root: __dirname });
        });

        app.get(`/public/js/jquery.min.js`, function (_req, resp) {
            resp.sendFile(`./public/js/jquery.min.js`, { root: __dirname });
        });

        app.get(`/public/js/bootstrap.min.js`, function (_req, resp) {
            resp.sendFile(`./public/js/bootstrap.min.js`, { root: __dirname });
        });

        app.get(`/public/css/login.css`, function (_req, resp) {
            resp.sendFile(`./public/css/login.css`, { root: __dirname });
        });

        app.get(`/public/css/admin.css`, function (_req, resp) {
            resp.sendFile(`./public/css/admin.css`, { root: __dirname });
        });

        app.get(`/public/css/error.css`, function (_req, resp) {
            resp.sendFile(`./public/css/error.css`, { root: __dirname });
        });

        app.get(`/`, async function (req, resp) {
            try {
                var cookieSessionID = req.cookies.sessionID;
            } catch (error) {
                return resp.render(`login`);
            };
            try {
                let connection = await pool.getConnection();
                let rows = await connection.query(`SELECT * FROM users WHERE sessionID LIKE "${cookieSessionID}"`);
                connection.end();
                if (rows.length == 1) {
                    return resp.redirect(`/admin`);
                } else {
                    return resp.render(`login`);
                };
            } catch (error) {
                fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                    if (error) {
                        console.error(error);
                        return resp.redirect(`/500`);
                    };
                });
                console.error(error);
                return resp.redirect(`/500`);
            };
        });

        app.post(`/`, async function (req, resp) {
            let username = req.body.username;
            let password = req.body.password;
            crypto.pbkdf2(password, `zokowrAprIxuhlswUKU6oMAqiho0ichoge4obRaCuT3xachudrehufRAwreprlFe`, 100000, 64, `sha512`, async function (error, derivedKey) {
                if (error) {
                    fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                        if (error) {
                            console.error(error);
                            return resp.redirect(`/500`);
                        };
                    });
                    console.error(error);
                    return resp.redirect(`/500`);
                } else {
                    let hashedPassword = derivedKey.toString(`hex`);
                    try {
                        let connection = await pool.getConnection();
                        let rows = await connection.query(`SELECT * FROM users WHERE username LIKE "${username}" AND password LIKE "${hashedPassword}"`);
                        connection.end();
                        if (rows.length == 1) {
                            let sessionID = crypto.randomBytes(64).toString(`hex`);
                            resp.cookie(`sessionID`, sessionID, { expires: new Date(Date.now() + 1800000) });
                            try {
                                let connection = await pool.getConnection();
                                let rows = await connection.query(`UPDATE users SET sessionID = "${sessionID}" WHERE username = "${username}"`);
                                connection.end();
                                resp.redirect(`/admin`);
                                return rows;
                            } catch (error) {
                                fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                                    if (error) {
                                        console.error(error);
                                        return resp.redirect(`/500`);
                                    };
                                });
                                console.error(error);
                                return resp.redirect(`/500`);
                            };
                        } else {
                            return resp.redirect(`/401`);
                        };
                    } catch (error) {
                        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                            if (error) {
                                console.error(error);
                                return resp.redirect(`/500`);
                            };
                        });
                        console.error(error);
                        return resp.redirect(`/500`);
                    };
                };
            });
        });

        app.get(`/admin`, async function (req, resp) {
            try {
                var cookieSessionID = req.cookies.sessionID;
            } catch (e) {
                return resp.redirect(`/401`);
            };
            try {
                let connection = await pool.getConnection();
                let rows = await connection.query(`SELECT * FROM users WHERE sessionID LIKE "${cookieSessionID}"`);
                connection.end();
                if (rows.length == 1) {
                    return resp.render(`./admin`);
                } else {
                    return resp.redirect(`/401`);
                };
            } catch (error) {
                fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                    if (error) {
                        console.error(error);
                        return resp.redirect(`/500`);
                    };
                });
                console.error(error);
                return resp.redirect(`/500`);
            };
        });

        app.post(`/update/:attribute`, async function (req, resp) {
            var attribute = req.params.attribute;
            var value = req.body.value;
            try {
                var cookieSessionID = req.cookies.sessionID;
            } catch (e) {
                resp.redirect(`/401`);
            };
            if (typeof value == `undefined`) {
                return resp.redirect(`/400`);
            } else if (value.match(ipregex) == null && attribute != `apikey`) {
                return resp.redirect(`/400`);
            } else {
                try {
                    let connection = await pool.getConnection();
                    let rows = await connection.query(`SELECT * FROM users WHERE sessionID LIKE "${cookieSessionID}"`);
                    connection.end();
                    if (rows.length == 1) {
                        try {
                            let connection = await pool.getConnection();
                            let rows = await connection.query(`UPDATE settings SET value = "${value}" WHERE attribute = "${attribute}"`);
                            connection.end();
                            if (rows.length == 1) {
                                return resp.render(`./admin`);
                            };
                        } catch (error) {
                            fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                                if (error) {
                                    console.error(error);
                                    return resp.redirect(`/500`);
                                };
                            });
                            console.error(error);
                            return resp.redirect(`/500`);
                        };
                    } else {
                        return resp.render(`/401`);
                    };
                } catch (error) {
                    fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                        if (error) {
                            console.error(error);
                            return resp.redirect(`/500`);
                        };
                    });
                    console.error(error);
                    return resp.redirect(`/500`);
                };
            };
        });

        app.get(`/400`, function (_req, resp) {
            resp.render(`400`);
        });

        app.get(`/401`, function (_req, resp) {
            resp.render(`401`);
        });

        app.get(`/404`, function (_req, resp) {
            resp.render(`404`);
        });

        app.get(`/500`, function (_req, resp) {
            resp.render(`500`);
        });

        app.get(`*`, function (_req, resp) {
            return resp.redirect(`/404`);
        });
    };
};

module.exports = Admin;
