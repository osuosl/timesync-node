/// <reference path='../typings/tsd.d.ts' />
var mocha = require('mocha');
var request_builder = require('request');
var expect = require('expect.js');
var app = require('../src/app');
var request = request_builder.defaults({encoding: null});

var port = process.env.PORT || 8000;
var base_url = 'http://localhost:' + port + '/';

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
