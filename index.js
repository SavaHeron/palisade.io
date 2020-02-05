'use strict';

/*
Name: 		index.js
Purpose:	A-Level Computer Science coursework	main script
Author:		Sava Max Heron
Created:	27/09/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

const mariadb = require(`mariadb`);
const util = require(`util`);
const exec = util.promisify(require(`child_process`).exec);
const ip = require(`ip`);
const Dnsserver = require(`./dns`);
const Dhcpserver = require(`./dhcp`);
//const App = require(`./admin`);

const dbuser = `root`;
const dbpassword = `9a_?KedofR-qewo`;
const localip = ip.address();
const resolver = `1.1.1.1`;
const apikey = `b8187ab8-b907-4a0f-a647-f7e508ee0ce7`;

const beginrange = `192.168.3.10`;
const endrange = `192.168.3.99`;
const netmask = '255.0.0.0';

const dns = new Dnsserver(dbuser, dbpassword, localip, resolver, apikey);
dns.startserver();

const dhcp = new Dhcpserver(beginrange, endrange, netmask, localip);
dhcp.startserver();

/*const app1 = new App(localip);
app1.startapp();*/
