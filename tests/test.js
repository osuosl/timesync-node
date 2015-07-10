require('../src/app');

var request_builder = require('request');
var expect = require('expect.js');
var sqlFixtures = require('sql-fixtures');

var request = request_builder.defaults({encoding: null});
var test_data = require('./fixtures/test_data');
var knexfile = require('../knexfile');
var knex = require('knex')(knexfile.mocha);

var port = process.env.PORT || 8000;
var base_url = 'http://localhost:' + port + '/v1/';

describe('Endpoints', function() {

    before(function(done) {
        knex.migrate.latest().then(function() {
            done();
        });
    });

    beforeEach(function(done) {
        this.timeout(5000);
        // Clear SQLite indexes
        knex.raw('delete from sqlite_sequence').then(function() {
            sqlFixtures.create(knexfile.mocha, test_data).then(function() {
                done();
            });
        });
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

    require('./times')(expect, request, base_url);
    require('./users')(expect, request, base_url);
    require('./activities')(expect, request, base_url);
    require('./projects')(expect, request, base_url);

});
