'use strict';

/*
Name: 		dhcp.js
Purpose:	A-Level Computer Science coursework DHCP script
Author:		Sava Max Heron
Created:	23/01/2020
Copyright:	(c) SMH 2020
Licence:	CC BY-NC-ND 4.0
*/

const dhcpd = require('dhcp');

/*const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "9a_?KedofR-qewo",
    connectionLimit: 5,
    database: "palisadeio"
});*/

let server = dhcpd.createServer({
    range: [
        "192.168.3.10", "192.168.3.99"
    ],
    netmask: '255.0.0.0',
    router: '10.0.0.1',
    dns: `10.0.0.1`,
    broadcast: `255.255.255.255`,
    server: '10.0.0.1',
});


class Dhcpserver {
    /*getvalues() {

    };*/

    startserver() {
        //this.getvalues();
        server.listen();
    };
};

module.exports = Dhcpserver;
