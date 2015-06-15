var mocha = require('mocha');
var request_builder = require('request');
var expect = require('expect.js');
var sqlFixtures = require('sql-fixtures');
var app = require('../src/app');

var request = request_builder.defaults({encoding: null});
var test_data = require('./fixtures/test_data');
var knexfile = require('../knexfile');
var knex = require('knex')(knexfile.development);

var port = process.env.PORT || 8000;
var base_url = 'http://localhost:' + port + '/v1/';

describe('Endpoints', function (){

  beforeEach(function(done) {
    this.timeout(5000);
    // Clear SQLite indexes
    knex.raw('delete from sqlite_sequence').then(function(resp) {
      sqlFixtures.create(knexfile.development, test_data).then(function() {
        done();
      });
    });
  });


  afterEach(function(done){
    this.timeout(5000);
    knex('projects').del().then(function() {
      knex('activities').del().then(function() {
        knex('users').del().then(function() {
          knex('checkins').del().then(function() {
            knex('slugs').del().then(function() {
              sqlFixtures.destroy().then(function() {
                done();
              });
            });
          });
        });
      });
    });
  });

  require('./checkins')(expect, request, base_url);
  require('./users')(expect, request, base_url);
  require('./activities')(expect, request, base_url);
  require('./projects')(expect, request, base_url);



  describe('GET /', function() {
    it ('should say javascript', function(done) {
      request.get(base_url, function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(bodyAsString).to.be('hello javascript');
        done();
      });
    });
  });

});
