var expect = require('chai').expect;
var supertest = require('supertest');
var app = require('../app');

describe('Client object validation tests:', function () {
  it('it allows valid input', function (done) {
    supertest(app)
    .post('/api/validation')
    .send({
      "username": "bwillis",
      "password": "",
      "first_name": "Bruce",
      "last_name": "Willis",
      "date_of_birth": "03/19/1955",
      "email": "bruce@willis.com",
      "phone": "424-288-2000",
      "address": {
        "street": "2000 Avenue Of The Stars",
        "city": "Los Angeles",
        "state": "CA",
        "zip_code": "90067"
      }
    })
    .expect(200)
    .end(function(err, res) {
        if (err) {
          return done(err);
        }
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('object');
        expect(res.body.result).to.be.equal('success');
        return done();
    });
  });
  it('rejects failure of one rule', function (done) {
    supertest(app)
    .post('/api/validation')
    .send({
      "username": "bwillis",
      "password": "q",
      "first_name": "Bruce",
      "last_name": "Willis",
      "date_of_birth": "03/19/1955",
      "email": "bruce@willis.com",
      "phone": "424-288-2000",
      "address": {
        "street": "2000 Avenue Of The Stars",
        "city": "Los Angeles",
        "state": "CA",
        "zip_code": "90067"
      }
    })
    .expect(400)
    .end(function(err, res) {
        if (err) {
            return done(err);
        }
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('object');
        expect(res.body.result).to.be.equal('failure');
        expect(res.body.rules).to.be.an('array');
        expect(res.body.rules.length).to.be.equal(1);
        expect(res.body.rules).to.be.an('array').that.includes('password_length');
        return done();
    });
  });

  it('rejects failure of all rules', function (done) {
    supertest(app)
    .post('/api/validation')
    .send({
      "username": "",
      "password": "a",
      "first_name": "Bruce",
      "last_name": "Willis",
      "date_of_birth": "03/19/1955",
      "email": "bruce@willis.com",
      "phone": "4-2-4-2-88-2jklfd000",
      "address": {
        "street": "2000 Avenue Of The Stars",
        "city": "Los Angeles",
        "state": "CA",
        "zip_code": "j39jd8j2"
      }
    })
    .expect(400)
    .end(function(err, res) {
        if (err) {
            return done(err);
        }
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('object');
        expect(res.body.result).to.be.equal('failure');
        expect(res.body.rules).to.be.an('array');
        expect(res.body.rules.length).to.be.equal(4);
        expect(res.body.rules).to.be.an('array').that.includes('username_length');
        expect(res.body.rules).to.be.an('array').that.includes('password_length');
        expect(res.body.rules).to.be.an('array').that.includes('phone_pattern');
        expect(res.body.rules).to.be.an('array').that.includes('zip_code_pattern');
        return done();
    });
  });

  it('rejects empty obj', function (done) {
    supertest(app)
    .post('/validation')
    .send({})
    .expect(400)
    .end(function(err, res) {
        if (err) {
            return done(err);
        }
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('object');
        expect(res.body.result).to.be.equal('failure');
        return done();
    });
  });

  it('rejects request with no body', function (done) {
    supertest(app)
    .post('/api/validation')
    .expect(400)
    .end(function(err, res) {
        if (err) {
            return done(err);
        }
        expect(res).to.be.an('object');
        expect(res.body).to.be.an('object');
        expect(res.body.result).to.be.equal('failure');
        return done();
    });
  });


});
