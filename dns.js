'use strict';

/*
Name: 		dns.js
Purpose:	A-Level Computer Science coursework DNS script
Author:		Sava Max Heron
Created:	11/11/2019
Copyright:	(c) SMH 2019
Licence:	CC BY-NC-ND 4.0
*/

const async = require(`async`);
const dns = require(`native-dns`);
//const fs = require(`fs`);
const mariadb = require(`mariadb`);
const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "9a_?KedofR-qewo",
    connectionLimit: 5,
    database: "palisadeio"
});

const udpserver = dns.createUDPServer();

class Dnsserver {
    constructor(ip, port, resolver) {
        this.serverip = ip;
        this.serverport = port;
        this.upstreamresolver = resolver;
    };

    async checkcache(domain) {
        try {
            let connection = await pool.getConnection();
            return await connection.query(`SELECT * FROM cache WHERE domain LIKE "${domain}"`) | 0;
        } catch (error) {
            return console.error(error);
            /*} finally {
                if (connection) {
                    return connection.end();
                };*/
        };
    };

    async updatecache(record, date) {
        let date = new Date();
        try {
            let connection = await pool.getConnection();
            return await connection.query(`UPDATE cache SET json = ${record}, retrieved = ${date}`) | 0;
        } catch (error) {
            return console.error(error);
            /*} finally {
                if (connection) {
                    return connection.end();
                };*/
        };
    };

    async insertcache(record) {
        let domain = record.question[0].name;
        let date = new Date();
        try {
            let connection = await pool.getConnection();
            return await connection.query(`INSERT INTO cache (domain, json, retreived) VALUES (${domain}, ${record}, ${date})`) | 0;
        } catch (error) {
            return console.error(error);
        } finally {
            if (connection) {
                connection.end();
            };
        };
    };

    updateinsertcache(record) {
        if (this.checkcache(domain)) {
            return this.updatecache(record)
        } else {
            return this.insertcache(record);
        };
    };

    async checkblock(domain) {
        try {
            let connection = await pool.getConnection();
            let temp = await connection.query(`SELECT * FROM block WHERE domain LIKE "${domain}"`);
            console.log(temp);
            return temp;
        } catch (error) {
            return console.error(error);
            /*} finally {
                if (connection) {
                    return connection.end();
                };*/
        };
    };

    async insertblock(domain) {
        try {
            let connection = await pool.getConnection();
            return await connection.query(`INSERT INTO block (domain) VALUES (${domain})`) | 0;
        } catch (error) {
            return console.error(error);
        } finally {
            if (connection) {
                return connection.end();
            };
        };
    };

    checkinsertblock(domain) {
        if (this.checkblock(domain)) {
            return 1;
        } else if (/*check if should be blocked*/false) {
            this.insertblock(domain);
            return 1;
        } else {
            return 0;
        };
    };

    forwardquery(forwardedquestion, response, callback) {
        console.log(`runn`);
        let forwardedrequest = dns.Request({
            question: forwardedquestion,
            server: this.upstreamresolver,
            cache: false
        });

        forwardedrequest.on(`message`, (_error, message) => {
            return message.answer.forEach(element => {
                return response.answer.push(element);
            });
        });

        console.log(`run`);

        forwardedrequest.on(`end`, callback);

        //this.insertcache(forwardedrequest);
        return forwardedrequest.send();
    };

    handlequery(request, response) {
        let i = [];
        console.log(`request`);
        /*fs.appendFile(`./logs/palisade.log`, `${request.type} query for ${request.question[0].name} from ${request.address.address}`, (error) => {
            throw error;
        });*/
        request.question.forEach(question => {
            if (this.checkinsertblock(request.question[0].name)) { //executed if the domain should be blocked
                return request.question.forEach(() => {
                    return response.answer.push(dns.A({
                        name: request.question[0].name,
                        address: `0.0.0.0`,
                        ttl: 1800
                    }));
                });

                //} else if (this.checktable(`cache`, `domain`, domain)) {   //if the dns server has already cached the domain's ip

                //} else if (this.checktable(`authority`, `domain`, domain)) {   //if is to block the domain

            } else {
                i.push(callback => {
                    return this.forwardquery(question, response, callback);
                });
            };
            return async.parallel(i, () => {
                return response.send();
            });
        });
    };

    startserver() {
        udpserver.serve(this.serverport, this.serverip);
        udpserver.on(`listening`, () => {
            return console.log(`listening on ${this.serverip}:${this.serverport}`);
        });
        udpserver.on(`close`, () => {
            return console.log(`closed`);
        });
        udpserver.on(`request`, (request, response) => {
            return this.handlequery(request, response);
        });
        udpserver.on(`error`, (error, _message, _response) => {
            fs.appendFile(`./logs/error.log`, error.stack, (error) => {
                throw error;
            });
            return console.log(error.stack);
        });
    };
};

module.exports = Dnsserver;

