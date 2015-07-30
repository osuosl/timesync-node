require('../src/app');

var requestBuilder = require('request');
var expect = require('expect.js');
var sqlFixtures = require('sql-fixtures');

var request = requestBuilder.defaults({encoding: null});
var testData = require('./fixtures/test_data');
var knexfile = require('../knexfile');
var knex = require('knex')(knexfile.mocha);

var port = process.env.PORT || 8000;
var baseUrl = 'http://localhost:' + port + '/v1/';

var reloadFixtures = function(done) {
    // Clear SQLite indexes
    knex.raw('delete from sqlite_sequence').then(function() {
        sqlFixtures.create(knexfile.mocha, testData).then(function() {
            done();
        });
    });
};

// clearDatabasePromises gets iterated over by Promise,
// this avoids the classic nested callback hell.
var clearDatabasePromises = [
    knex('projects').del(),
    knex('activities').del(),
    knex('users').del(),
    knex('times').del(),
    knex('activityslugs').del(),
    knex('projectslugs').del(),
    sqlFixtures.destroy(),
];

// clearDatabase is a callback function,
// it used to look a lot uglier.
var clearDatabase = (function(done) {
    // This line actually iterates through the list databsePromises
    Promise.all(clearDatabasePromises).then(function() {
        done();
    });
});

describe('Endpoints', function() {
    this.timeout(5000);

    before(function(done) {
        knex.migrate.latest().then(function() {
            done();
        });
    });

    beforeEach(function(done) {
        reloadFixtures(done);
    });

    afterEach(function(done) {
        this.timeout(5000);
        knex('projects').del().then(function() {
            knex('activities').del().then(function() {
                knex('users').del().then(function() {
                    knex('times').del().then(function() {
                        knex('projectslugs').del().then(function() {
                            knex('timesactivities').del().then(function() {
                                sqlFixtures.destroy().then(function() {
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    require('./times')(expect, request, baseUrl);
    require('./users')(expect, request, baseUrl);
    require('./activities')(expect, request, baseUrl);
    require('./projects')(expect, request, baseUrl);

});

describe('Helpers', function() {
    this.timeout(5000);

    before(function(done) {
        knex.migrate.latest().then(function() {
            done();
        });
    });

    beforeEach(function(done) {
        reloadFixtures(done);
    });

    afterEach(function(done) {
        clearDatabase(done);
    });

});
