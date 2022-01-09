var request = require('supertest');
const express = require('express');

const app = express();

/* eslint-disable no-unused-vars, no-undef */
app.get('/', function(req, res) {
    res.status(200);
});

describe('Core controller unit tests:', function() {
    before(function(done) {
        request = request('http://localhost:1338');

        done();
    });

    describe('Loading the home-page', function() {
        it('should return 200 from GET /', function(done) {
            request
                .get('/')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200, done);
        });
    });

    describe('Loading the register-page', function() {
        it('should return 200 from GET /register', function(done) {
            request
                .get('/register')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200, done);
        });
    });

    describe('Loading map', function() {
        it('Test login -> return 302 GET /map', function(done) {
            request
                .post('/')
                .send({username: 'test@test.se', password: 'test123'})
                .expect(302)
                .expect('Location', '/map')
                .end(done);
        });
    });



    after(function(done) {
        done();
    });
});
/* eslint-disable no-unused-vars, no-undef */
