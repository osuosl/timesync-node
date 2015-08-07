require('../src/app');

var requestBuilder = require('request');
var expect = require('chai').expect;
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

var clearDatabase = (function(done) {
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
        clearDatabase(done);
    });

    require('./times')(expect, request, baseUrl);
    require('./activities')(expect, request, baseUrl);
    require('./projects')(expect, request, baseUrl);

});

describe('Errors', function() {
    require('./errors')(expect);
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

    var localPassport = require('../src/auth/local.js')(knex);
    require('./login')(expect, localPassport);
    require('./helpers')(expect);
});
