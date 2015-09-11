'use strict';

const requestBuilder = require('request');
const expect = require('chai').expect;
const SqlFixtures = require('sql-fixtures');

const request = requestBuilder.defaults({encoding: null});
const testData = require('./fixtures/test_data');
const knexfile = require('../knexfile');
const knex = require('knex')(knexfile.mocha);
const fixtureCreator = new SqlFixtures(knex);

GLOBAL.knex = knex;
const app = require('../src/app');

const port = process.env.PORT || 8000;
const baseUrl = 'http://localhost:' + port + '/v1/';

const reloadFixtures = function(done) {
  // Clear SQLite indexes
  //knex.raw('delete from sqlite_sequence').then(function() {
    fixtureCreator.create(testData).then(function() {
      done();
    });
  //});
};

const clearDatabase = function(done) {
  knex.raw('TRUNCATE projects CASCADE').then(function() {
    knex.raw('TRUNCATE activities CASCADE').then(function() {
      knex.raw('TRUNCATE users CASCADE').then(function() {
        knex.raw('TRUNCATE times RESTART IDENTITY CASCADE').then(function() {
          knex.raw('TRUNCATE projectslugs CASCADE').then(function() {
            knex.raw('TRUNCATE userroles RESTART IDENTITY CASCADE').then(function() {
              knex.raw('TRUNCATE timesactivities CASCADE').then(done);
            });
          });
        });
      });
    });
  });
};

describe('Endpoints', function() {
  beforeEach(function(done) {
    knex.migrate.latest().then(function() {
      clearDatabase(function() {
        reloadFixtures(done);
      });
    });
  });

  require('./times')(expect, request, baseUrl);
  require('./activities')(expect, request, baseUrl);
  require('./projects')(expect, request, baseUrl);
});

describe('Errors', function() {
  require('./errors')(expect);
});

describe('Helpers', function() {
  beforeEach(function(done) {
    knex.migrate.latest().then(function() {
      clearDatabase(function() {
        reloadFixtures(done);
      });
    });
  });

  const localPassport = require('../src/auth/local.js')(knex);
  require('./login')(expect, localPassport);
  require('./helpers')(expect, app);
});
