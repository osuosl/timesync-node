var requestBuilder = require('request');
var expect = require('chai').expect;
var SqlFixtures = require('sql-fixtures');

var request = requestBuilder.defaults({encoding: null});
var testData = require('./fixtures/test_data');
var knexfile = require('../knexfile');
var knex = require('knex')(knexfile.mocha);
var fixtureCreator = new SqlFixtures(knex);

GLOBAL.knex = knex;
var app = require('../src/app');

var port = process.env.PORT || 8000;
var baseUrl = 'http://localhost:' + port + '/v1/';

var reloadFixtures = function(done) {
    // Clear SQLite indexes
    knex.raw('delete from sqlite_sequence').then(function() {
        fixtureCreator.create(testData).then(function() {
            done();
        });
    });
};

var clearDatabase = (function(done) {
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
});

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

    var localPassport = require('../src/auth/local.js')(knex);
    require('./login')(expect, localPassport);
    require('./helpers')(expect, app);
});
