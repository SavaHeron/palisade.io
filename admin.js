'use strict';

/*
Name: 		admin.js
Purpose:	A-Level Computer Science coursework admin script
Author:		Sava Max Heron
Created:	21/01/2020
Copyright:	(c) SMH 2020
Licence:	CC BY-NC-ND 4.0
*/

var express = require('express');
const mysql = require('mysql');
const mariadb = require(`mariadb`);
const app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "9a_?KedofR-qewo",
    connectionLimit: 5,
    database: "palisadeio"
});
