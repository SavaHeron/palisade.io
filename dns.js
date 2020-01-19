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
const dt = require(`date-and-time`);
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

    analyseblock(domain) {
        if (true) {
            return undefined;
        } else {
            return 1;
        };
    };

    async checkcache(domain, type) {  //finished
        try {
            let connection = await pool.getConnection();
            let rows = await connection.query(`SELECT * FROM cache WHERE domain LIKE "${domain}" AND type LIKE ${type}`);
            connection.end();
            return rows[0];
        } catch (error) {
            return console.error(error);
        };
    };

    async updatecache(domain, response, type, ttl) { //finished
        try {
            let connection = await pool.getConnection();
            let record = [];
            record.push(response.question);
            record.push(response.answer);
            let rows = await connection.query(`UPDATE cache SET record = ${JSON.stringify(JSON.stringify(record))} WHERE domain = "${domain}" AND type = ${type} AND ttl = ${ttl}`);
            connection.end();
            return rows;
        } catch (error) {
            return console.error(error);
        };
    };

    async insertcache(domain, response, type, ttl) { //finished
        try {
            let connection = await pool.getConnection();
            let record = [];
            record.push(response.question);
            record.push(response.answer);
            let rows = await connection.query(`INSERT INTO cache (domain, record, type, ttl) VALUES ("${domain}", ${JSON.stringify(JSON.stringify(record))}, ${type}, ${ttl})`);
            connection.end();
            return rows;
        } catch (error) {
            return console.error(error);
        };
    };

    async updateinsertcache(domain, response, type, ttl) {   //finished
        let cache = await this.checkcache(domain, type);
        if (typeof cache != `undefined`) {
            let rows = this.updatecache(domain, response, type, ttl);
            return rows;
        } else {
            let rows = this.insertcache(domain, response, type, ttl)
            return rows;
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

    async insertblock(domain) { //finished not tested
        try {
            let connection = await pool.getConnection();
            let rows = await connection.query(`INSERT INTO block (domain) VALUES (${domain})`);
            connection.end();
            return rows;
        } catch (error) {
            return console.error(error);
        };
    };

    async checkinsertblock(domain) {    //finished not tested
        let block = await this.checkblock(domain);
        let analysis = this.analyseblock(domain);
        if (typeof block != `undefined`) {
            return 1;
        } else if (typeof analysis != `undefined`) {
            this.insertblock(domain);
            return 1;
        } else {
            return 0;
        };
    };

    forwardquery(forwardedquestion, response, callback) {   //forwards the query to the upstream resolver - finished
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

        return forwardedrequest.send();
    };

    async handlequery(request, response) {
        let i = [];
        let block = await this.checkinsertblock(request.question[0].name);
        let querytype = JSON.stringify(request.question[0].type);
        let queryttl = JSON.stringify(request.question[0].ttl);
        let cache = await this.checkcache(request.question[0].name, querytype);

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

            } else if (typeof cache != `undefined`) {   //if the dns server has already cached the domain's ip
                let now = new Date();
                let then = new Date(cache.retrieved);
                let thenplusttl = dt.addSeconds(then, +cache.ttl);
                if (now.getTime() > thenplusttl.getTime()) {    //if the record is valid
                    var valid = 1
                    request.question.forEach(() => {
                        let answer = JSON.parse(cache.record);
                        if (answer[1].length = 1) {
                            return response.answer.push(answer[1][0]);
                        } else if (answer[1].length = 0) {
                            return console.log(0);
                        } else {
                            return response.answer.push(answer[1]);
                        };
                    });
                } else {    //if the record is not valid
                    var valid = 0
                    console.log(`valid = ${valid}`)
                    i.push(callback => {
                        return this.forwardquery(question, response, callback);
                    });
                };

            } else {
                i.push(callback => {
                    return this.forwardquery(question, response, callback);
                });
            };

            return async.parallel(i, () => {
                if (block != 1 && valid != 1) {
                    console.log(`recaching`)
                    this.updateinsertcache(request.question[0].name, response, querytype, queryttl);
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
