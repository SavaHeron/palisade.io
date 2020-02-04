'use strict';

/*
Name: 		index.js
Purpose:	A-Level Computer Science coursework	main script
Author:		Sava Max Heron
Created:	27/09/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

const Dnsserver = require(`./dns`);
const Dhcpserver = require(`./dhcp`);
//const App = require(`./admin`);
const ip = require(`ip`);

const localip = ip.address();

const externalresolver = `1.1.1.1`;

const apikey = `b8187ab8-b907-4a0f-a647-f7e508ee0ce7`;

//const appport = 8080

/*const app1 = new App(localip);
app1.startapp();*/

const dns = new Dnsserver(localip, externalresolver, apikey);
dns.startserver();

const dhcp = new Dhcpserver(localip);
dhcp.startserver();
