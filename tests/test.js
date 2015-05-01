var mocha = require('mocha');
var request_builder = require('request');
var expect = require('expect.js');
var sqlFixtures = require('sql-fixtures');
var app = require('../src/app');

var request = request_builder.defaults({encoding: null});
var test_data = require('./fixtures/test_data');
var knexfile = require('../knexfile');
var knex = require('knex')(knexfile.development);;

var port = process.env.PORT || 8000;
var base_url = 'http://localhost:' + port + '/';

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
            sqlFixtures.destroy().then(function() {
              done();
            });
          });
        });
      });
    });
  });



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

  describe('GET /checkins', function() {
    it ('should return all checkins in the database', function(done) {
      request.get(base_url + 'checkins', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "duration": 12,
            "user": 2,
            "project": 3,
            "activity": 2,
            "notes": "",
            "issue_uri": "https://github.com/osu-cass/whats-fresh-api/issues/56",
            "date_worked": null,
            "created_at": null,
            "updated_at": null,
            "id": 1
          }
        ];
        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(JSON.parse(bodyAsString)).to.eql(expected_results);
        done();
      });
    });
  });




  describe('GET /users', function() {
    it ('should return all users in the database', function(done) {
      request.get(base_url + 'users', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "id": 1,
            "username": "deanj"
          },
          {
            "id": 2,
            "username": "tschuy"
          }
        ];
        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(JSON.parse(bodyAsString)).to.eql(expected_results);
        done();
      });
    });
  });

  describe('GET /activities', function() {
    it ('should return all activities in the database', function(done) {
      request.get(base_url + 'activities', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "name": "Documentation",
            "alias": "doc",
            "id": 1
          },
          {
            "name": "Development",
            "alias": "dev",
            "id": 2
          },
          {
            "name": "Systems",
            "alias": "sys",
            "id": 3
          }
        ];
        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(JSON.parse(bodyAsString)).to.eql(expected_results);
        done();
      });
    });
  });


  describe('GET /projects', function() {
    it ('should return all projects in the database', function(done) {
      request.get(base_url + 'projects', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "uri": "https://code.osuosl.org/projects/ganeti-webmgr",
            "name": "Ganeti Web Manager",
            "alias": "gwm",
            "owner": 2,
            "id": 1
          },
          {
            "uri": "https://code.osuosl.org/projects/pgd",
            "name": "Protein Geometry Database",
            "alias": "pgd",
            "owner": 1,
            "id": 2
          },
          {
            "uri": "https://github.com/osu-cass/whats-fresh-api",
            "name": "Whats Fresh",
            "alias": "wf",
            "owner": 2,
            "id": 3
          }
        ];
        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(JSON.parse(bodyAsString)).to.eql(expected_results);
        done();
      });
    });
  });
});
