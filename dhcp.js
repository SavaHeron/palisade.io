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

class DHCPserver {
    constructor(beginrange, endrange, netmask, ip) {
        this.server = dhcpd.createServer({
            range: [
                beginrange, endrange
            ],
            netmask: netmask,
            router: ip,
            dns: ip,
            broadcast: `255.255.255.255`,
            server: ip,
        });
    };

    startserver() {
        this.server.listen();
    };
};

module.exports = DHCPserver;
