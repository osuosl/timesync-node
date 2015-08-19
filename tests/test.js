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
  knex.raw('delete from sqlite_sequence').then(function() {
    fixtureCreator.create(testData).then(function() {
      done();
    });
  });
};

const clearDatabase = function(done) {
  knex('projects').del().then(function() {
    knex('activities').del().then(function() {
      knex('users').del().then(function() {
        knex('times').del().then(function() {
          knex('projectslugs').del().then(function() {
            knex('timesactivities').del().then(done);
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
