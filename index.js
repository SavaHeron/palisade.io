'use strict';

/*
Name: 		index.js
Purpose:	A-Level Computer Science coursework	main script
Author:		Sava Max Heron
Created:	27/09/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

const Dnsserver = require (`./dns`);
//const App = require(`./admin`);
//const setup = require(`./setup`);
const ip = require(`ip`);

const localip = ip.address();

const externalresolver1 = {
	address: `1.1.1.1`,
	type: `udp`,
	port: 53
};

const externalresolver2 = {
	address: `1.0.0.1`,
	type: `udp`,
	port: 53
};

//const appport = 80

/*const app1 = new App(appport);
app1.startapp();*/

const dns1 = new Dnsserver(localip, 53,  externalresolver1);
dns1.startserver();

/*const dns2 = new Server(localip, 53, externalresolver2);
dns2.startserver();*/
