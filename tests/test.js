'use strict';

const requestBuilder = require('request');
const expect = require('chai').expect;
const SqlFixtures = require('sql-fixtures');

const request = requestBuilder.defaults({encoding: null});
const testData = require('./fixtures/test_data');
const knexfile = require('../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV]);

const port = process.env.PORT || 8000;
const baseUrl = 'http://localhost:' + port + '/v0/';

const app = require('../src/app');
let trx;

const transact = function(done) {
  knex.transaction(function(newTrx) {
    trx = newTrx;
    app.set('knex', trx);

    const fixtureCreator = new SqlFixtures(trx);
    if (process.env.NODE_ENV === 'mocha_sqlite') {
      fixtureCreator.create(testData).then(function() {
        done();
      });
    } else {
      fixtureCreator.create(testData).then(function() {
        newTrx.raw("SELECT setval('times_id_seq', " +
        '(SELECT MAX(id) FROM times));').then(function() {
          newTrx.raw("SELECT setval('activities_id_seq', " +
          '(SELECT MAX(id) FROM activities));').then(function() {
            newTrx.raw("SELECT setval('projects_id_seq', " +
            '(SELECT MAX(id) FROM projects));').then(function() {
              newTrx.raw("SELECT setval('timesactivities_id_seq', " +
              '(SELECT MAX(id) FROM timesactivities));').then(function() {
                newTrx.raw("SELECT setval('projectslugs_id_seq', " +
                '(SELECT MAX(id) FROM projectslugs));').then(function() {
                  newTrx.raw("SELECT setval('users_id_seq', " +
                  '(SELECT MAX(id) FROM users));').then(function() {
                    done();
                  });
                });
              });
            });
          });
        });
      });
    }
  }).catch(function(e) {
    // only swallow the test rollback error
    if (e !== 'test rollback') {
      throw e;
    }
  });
};

const endTransact = function(done) {
  trx.rollback('test rollback').then(function() {
    done();
  });
};

describe('Basic', function() {
  this.timeout(1000);
  beforeEach(transact);
  afterEach(endTransact);

  before(function(done) {
    knex.migrate.latest().then(function() {
      done();
    });
  });

  it('should have a response at base URL', function(done) {
    request.get(baseUrl, function(err, res, body) {
      expect(body.toString()).to.equal('Cannot GET /v0/\n');
      done();
    });
  });

  it('should return an error on invalid JSON', function(done) {
    const requestOptions = {
      url: baseUrl + 'login',
      body: '{"auth": {"type": "password", username: "sManager". password: ' +
      'drowssap}',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    request.post(requestOptions, function(err, res, body) {
      expect(JSON.parse(body)).to.deep.equal({
        status: 400,
        error: 'Bad object',
        text: 'The request body could not be parsed as valid JSON',
      });

      done();
    });
  });
});

describe('Endpoints', function() {
  this.timeout(1000);
  beforeEach(transact);
  afterEach(endTransact);

  before(function(done) {
    knex.migrate.latest().then(function() {
      done();
    });
  });

  require('./times')(expect, request, baseUrl);
  require('./activities')(expect, request, baseUrl);
  require('./projects')(expect, request, baseUrl);
  require('./users')(expect, request, baseUrl);
});

describe('Errors', function() {
  require('./errors')(expect);
});

describe('Helpers', function() {
  this.timeout(1000);
  beforeEach(transact);
  afterEach(endTransact);

  before(function(done) {
    knex.migrate.latest().then(function() {
      done();
    });
  });

  require('./helpers')(expect, app);
});

describe('Login', function() {
  this.timeout(1000);
  beforeEach(transact);
  afterEach(endTransact);

  const localPassport = require('../src/auth/local')(app);
  const ldapPassport = require('../src/auth/ldap')(app);

  require('./login/password')(expect, localPassport);
  require('./login/ldap')(expect, ldapPassport);
  require('./login/token')(expect, request, baseUrl);
});
