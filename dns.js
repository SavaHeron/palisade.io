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
const fs = require(`fs`);
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

    async checkcache(domain) {  //finished
        try {
            let connection = await pool.getConnection();
            let rows = await connection.query(`SELECT * FROM cache WHERE domain LIKE "${domain}"`);
            console.log(rows[0]);
            connection.end();
            return rows;
        } catch (error) {
            return console.error(error);
        };
    };

    async updatecache(record, date) {
        let date = new Date();
        try {
            let connection = await pool.getConnection();
            return await connection.query(`UPDATE cache SET json = ${record}, retrieved = ${date}`);
        } catch (error) {
            return console.error(error);
        };
    };

    async insertcache(domain, response) {
        try {
            let connection = await pool.getConnection();
            let rows = await connection.query(`INSERT INTO cache (domain, record) VALUES ("${domain}", "${JSON.stringify(JSON.stringify(response))}")`);
            connection.end();
            return rows;
        } catch (error) {
            return console.error(error);
        };
    };

    updateinsertcache(domain, response) {
        if (this.checkcache(domain)) {
            return this.updatecache(response)
        } else {
            return this.insertcache(response);
        };
    };

    async checkblock(domain) {  //finished 
        try {
            let connection = await pool.getConnection();
            let rows = await connection.query(`SELECT * FROM block WHERE domain LIKE "${domain}"`);
            connection.end();
            return rows[0];
        } catch (error) {
            return console.error(error);
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

    async checkinsertblock(domain) {
        let block = await this.checkblock(domain);
        if (typeof block != `undefined`) {
            return 1;
        } else if (/*check if should be blocked*/false) {
            this.insertblock(domain);
            return 1;
        } else {
            return 0;
        };
    };

    forwardquery(forwardedquestion, response, callback) {
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

        forwardedrequest.on(`end`, callback);

        //this.insertcache(forwardedrequest);
        //console.log(`cache`);

        return forwardedrequest.send();
    };

    async handlequery(request, response) {
        let i = [];
        let block = await this.checkinsertblock(request.question[0].name);
        let cache = await this.checkcache(request.question[0].name);

        fs.appendFile(`./logs/palisade.log`, `${request.type} query for ${request.question[0].name} from ${request.address.address}\n`, (error) => {
            if (error) throw error;
        });

        request.question.forEach(question => {
            if (block == 1) { //executed if the domain should be blocked
                request.question.forEach(() => {    //answers each query with 0.0.0.0
                    return response.answer.push(dns.A({
                        name: request.question[0].name,
                        address: `0.0.0.0`,
                        ttl: 1800
                    }));
                });

                /*} else if (cache == 1) {   //if the dns server has already cached the domain's ip
                request.question.forEach(() => {    //answers each query with 0.0.0.0
                    return response.answer.push(dns.A({
                        name: request.question[0].name,
                        address: `1.2.3.4`,
                        ttl: 1800
                    }));
                });*/

                //} else if (this.checktable(`authority`, `domain`, domain)) {   //if is to block the domain

            } else {
                i.push(callback => {
                    return this.forwardquery(question, response, callback);
                });
            };

            return async.parallel(i, () => {
                if (block != 1) {
                    this.insertcache(request.question[0].name, response);
                };
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
            fs.appendFile(`./logs/error.log`, `${error.stack}\n`, (error) => {
                if (error) throw error;
            });
            return console.error(error.stack);
        });
    };
};

module.exports = Dnsserver;
