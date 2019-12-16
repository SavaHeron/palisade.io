/*
Name: 		index.js
Purpose:	A-Level Computer Science coursework	main script
Author:		Sava Max Heron
Created:	27/09/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

const Dnsserver = require (`./dns`);
//const App = require(`./app`);
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

//const appport1 = 80

//const appport2 = 8080

/*const app1 = new App(appport1);
app1.startapp();*/

/*const app2 = new App(appport2);
app2.startapp();*/

const dns1 = new Dnsserver(localip, 53,  externalresolver1);
dns1.startserver();

//const dns2 = new Server(localip, externalresolver2);
//dns2.startserver();
