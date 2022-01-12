process.env.NODE_ENV = 'test';

var request = require('supertest');
const express = require('express');
const server = require('../app.js');
const chai = require('chai');
const app = express();

//var assert = chai.assert;    // Using Assert style
//var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style
var xToken = "mockTest";

/* eslint-disable no-unused-vars, no-undef */
describe('Test for failed', function() {

    describe('Fail logging in to the home-page', function() {
        it('should return 200 from GET /', function(done) {
            request(server)
                .post('/')
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    //res.text.should.be.equal("Found. Redirecting to /map");
                    if (err) {
                      throw err;
                    }
                    done();
                });
        });
    });

    describe('/map failed', function() {
        it('should return 200 from GET /map', function(done) {
            request(server)
                .get('/map')
                .end((err, res) => {
                    res.status.should.be.equal(302);
                    if (err) {
                      throw err;
                    }
                    done();
                });
        });
    });
});

describe('Core controller unit tests:', function() {
    describe('Loading the home-page', function() {
        it('should return 200 from GET /', function(done) {
            request(server)
                .get('/')
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    res.text.should.match(/name="username"/);
                    res.text.should.match(/name="password"/);
                    res.text.should.match(/action="[/]"/);
                    if (err) {
                      throw err;
                    }
                    done();
                });
        });
    });

    describe('Logging in to the home-page', function() {
        it('should return 302 from GET /', function(done) {
            request(server)
                .post('/')
                .send({username: "test1@test.com", password: "test123"})
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    if (err) {
                      throw err;
                    }
                    done();
                });
        });
    });

    describe('Loading the register-page', function() {
        it('should return 200 from GET /register', function(done) {
            request(server)
                .get('/register')
                .end((err, res) => {
                    res.status.should.be.equal(200);
                    res.text.should.match(/name="username"/);
                    res.text.should.match(/name="password"/);
                    res.text.should.match(/action="[/]register"/);
                    if (err) {
                      throw err;
                    }
                    done();
                });
        });
    });

    after(function(done) {
        done();
    });
});

/* eslint-disable no-unused-vars, no-undef */
