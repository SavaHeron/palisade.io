'use strict';

/*
Name: 		admin.js
Purpose:	A-Level Computer Science coursework admin script
Author:		Sava Max Heron
Created:	21/01/2020
Copyright:	(c) SMH 2020
Licence:	CC BY-NC-ND 4.0
*/

const express = require('express');
const fs = require(`fs`);
const async = require(`async`);
const mariadb = require(`mariadb`);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sessions = require('express-session');
//const crypto = require('crypto');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessions({
    secret: '^78skdm£$ss(4wi^&%$',
    resave: false,
    saveUninitialized: false
}));

class Admin {
    constructor(localip, dbuser, dbpassword) {
        this.localip = localip;
        this.pool = mariadb.createPool({
            host: `localhost`,
            user: dbuser,
            password: dbpassword,
            connectionLimit: 5,
            database: `palisadeio`
        });
    };

    startserver() {
        app.listen(80, this.localip);

        /*app.get('/', function (_req, resp) {
            resp.status(200);
            resp.send(`OK`);
        });*/

        app.get('/public/css/bootstrap.min.css', function (_req, resp) {
            resp.sendFile('./public/css/bootstrap.min.css', { root: __dirname });
        });

        app.get('/public/js/jquery.min.js', function (_req, resp) {
            resp.sendFile('./public/js/jquery.min.js', { root: __dirname });
        });

        app.get('/public/js/bootstrap.min.js', function (_req, resp) {
            resp.sendFile('./public/js/bootstrap.min.js', { root: __dirname });
        });

        app.get('/', async function (req, resp) {
            try {
                var cookieSessionID = req.cookies.sessionID;
            } catch (e) {
                resp.render('login');
            };
            try {
                let connection = await this.pool.getConnection();
                let rows = await connection.query(`SELECT * FROM users WHERE sessionID LIKE "${cookieSessionID}"`);
                connection.end();
                if (rows[0].length == 1) {
                    resp.status(200);
                            resp.send(`OK`);
                } else {
                    resp.render('login');
                };
            } catch (error) {
                fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                    if (error) {
                        return console.error(error);
                    };
                });
                return console.error(error);
            };
        });

        /*app.post('/', function (req, resp) {
            var username = req.body.username;
            var password = req.body.password;
            crypto.pbkdf2(password, 'zokowrAprIxuhlswUKU6oMAqiho0ichoge4obRaCuT3xachudrehufRAwreprlFe', 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) {
                    resp.status(500);
                    resp.send(`500`);
                }
                var hashedPassword = derivedKey.toString('hex');
                ketabmar.query('SELECT * FROM users WHERE username=? AND password=? LIMIT 1', [username, hashedPassword], function (err, rows) {
                    if (err) {
                        resp.status(500);
                        resp.send(`500`);
                    }
                    if (rows.length == 1) {
                        var sessionID = crypto.randomBytes(64).toString('hex');
                        resp.cookie('sessionID', sessionID, { expires: new Date(Date.now() + 1800000) });
                        ketabmar.query('UPDATE users SET sessionID=? where username=?', [sessionID, username], function (err) {
                            if (err) {
                                resp.status(500);
                                resp.send(`500`);
                            }
                            resp.status(200);
                            resp.send(`OK`);
                        });
                    } else {
                        resp.status(401);
                        resp.send(`UNAUTH`);
                    }
                });
            });
        });*/

        app.get('*', function (_req, resp) {
            resp.status(404);
            resp.send(`NOT FOUND`);
        });
    };
};

module.exports = Admin;
