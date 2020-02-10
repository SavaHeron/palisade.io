'use strict';

/*
Name: 		index.js
Purpose:	A-Level Computer Science coursework	main script
Author:		Sava Max Heron
Created:	27/09/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

//const mariadb = require(`mariadb`);
const util = require(`util`);
const exec = util.promisify(require(`child_process`).exec);
const DNSServer = require(`./dns`);
const DHCPServer = require(`./dhcp`);
const admin = require(`./admin`);

const dbuser = `root`;
const dbpassword = `9a_?KedofR-qewo`;
const localip = `10.0.0.1`;
const resolver = `1.1.1.1`;
const apikey = `b8187ab8-b907-4a0f-a647-f7e508ee0ce7`;
const dns = new DNSServer(dbuser, dbpassword, localip, resolver, apikey);

const beginrange = `192.168.3.10`;
const endrange = `192.168.3.99`;
const netmask = '255.0.0.0';
const broadcast = `10.255.255.255`;
const dhcp = new DHCPServer(beginrange, endrange, netmask, localip);

async function setnameserver(resolver) {
    try {
        const { stdout, stderr } = await exec(`echo nameserver ${resolver} | sudo tee /etc/resolv.conf`);
        console.log(`stdout:`, stdout);
        console.log(`stderr:`, stderr);
    } catch (error) {
        console.error(err);
    };
};

async function setnat() {
    try {
        const { stdout, stderr } = await exec(`sudo iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE`);
        console.log(`stdout:`, stdout);
        console.log(`stderr:`, stderr);
    } catch (error) {
        console.error(err);
    };
};

async function setstaticip(localip) {
    try {
        const { stdout, stderr } = await exec(`sudo ip addr add ${localip}/8 dev eth0 broadcast ${broadcast} | sudo route add -host 255.255.255.255 eth0`);
        console.log(`stdout:`, stdout);
        console.log(`stderr:`, stderr);
    } catch (error) {
        console.error(err);
    };
};


function start() {
    setnameserver(resolver);
    setnat();
    setstaticip(localip);
    dns.startserver();
    dhcp.startserver();
};

/*const app1 = new App(localip);
app1.startapp();*/

start();
