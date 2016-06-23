'use strict';

const chai = require('chai');
chai.use(require('chai-passport-strategy'));

module.exports = function(expect, localPassport) {
  describe('Password-based login', function() {
    it('returns user for good user/pass', function(done) {
      chai.passport.use(localPassport).success(function(user) {
        // Called when passport successfully logs in
        expect(user.username).to.equal('admin1');
        done();
      }).req(function(req) {
        req.body = {};
        req.body.auth = {};
        req.body.auth.type = 'password';
        req.body.auth.username = 'admin1';
        req.body.auth.password = 'password';
      }).authenticate();
    });

    it('returns invalid username message for bad user', function(done) {
      chai.passport.use(localPassport).fail(function(challenge) {
        // Called when passport fails to log in
        expect(challenge.message).to.equal('Incorrect username or password');
        done();
      }).req(function(req) {
        req.body = {};
        req.body.auth = {};
        req.body.auth.type = 'password';
        req.body.auth.username = 'notauser';
        req.body.auth.password = 'password';
      }).authenticate();
    });

    it('returns invalid password message for bad pass', function(done) {
      chai.passport.use(localPassport).fail(function(challenge) {
        // Called when passport fails to log in
        expect(challenge.message).to.equal('Incorrect username or password');
        done();
      }).req(function(req) {
        req.body = {};
        req.body.auth = {};
        req.body.auth.type = 'password';
        req.body.auth.username = 'admin1';
        req.body.auth.password = 'pass';
      }).authenticate();
    });

    it('returns missing creds message when no user/pass', function(done) {
      chai.passport.use(localPassport).fail(function(challenge) {
        // Called when passport fails to log in
        expect(challenge.message).to.equal('Missing credentials');
        done();
      }).req(function(req) {
        req.body = {};
      }).authenticate();
    });
  });
};
