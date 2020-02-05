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
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.get('/', function (_req, resp) {
    resp.status(200);
    resp.send(`OK`);
});

app.listen(80);
