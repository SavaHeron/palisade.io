'use strict';

/*
Name: 		index.js
Purpose:	A-Level Computer Science coursework	main script
Author:		Sava Max Heron
Created:	27/09/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

const util = require(`util`);
const exec = util.promisify(require(`child_process`).exec);
const fs = require(`fs`);
const mariadb = require(`mariadb`);
const DNSServer = require(`./dns`);
const DHCPServer = require(`./dhcp`);
//const admin = require(`./admin`);

const dbuser = `root`;
const dbpassword = `9a_?KedofR-qewo`;

const pool = mariadb.createPool({
    host: `localhost`,
    user: dbuser,
    password: dbpassword,
    connectionLimit: 5,
    database: `palisadeio`
});

async function getlocalip() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "localip"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getresolver() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "resolver"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getapikey() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "apikey"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getbeginrange() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "beginrange"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getendrange() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "endrange"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getnetmask() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "netmask"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getbroadcast() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT value FROM settings WHERE attribute LIKE "broadcast"`);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

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

async function setstaticip(localip, broadcast) {
    try {
        const { stdout, stderr } = await exec(`sudo ip addr add ${localip}/8 dev eth0 broadcast ${broadcast} | sudo route add -host 255.255.255.255 eth0`);
        console.log(`stdout:`, stdout);
        console.log(`stderr:`, stderr);
    } catch (error) {
        console.error(err);
    };
};

async function start() {
    //get params from database
    const localip = await getlocalip();
    const resolver = await getresolver();
    const apikey = await getapikey();
    const beginrange = await getbeginrange();
    const endrange = await getendrange();
    const netmask = await getnetmask();
    const broadcast = await getbroadcast();

    const temp = JSON.stringify(Object.values(netmask))

    //setup network environment
    //setnameserver(resolver);
    //setnat();
    //setstaticip(localip, broadcast);

    //define DNS, DHCP and web servers
    //const dns = new DNSServer(dbuser, dbpassword, localip, resolver, apikey);
    //const dhcp = new DHCPServer(beginrange, endrange, netmask, localip);
    //const admin = new admin(localip);

    //start DNS, DHCP and web servers
    console.log(temp);//dns.startserver();
    //dhcp.startserver();
    //admin.startserver();
};

start();        //this starts the solution 
