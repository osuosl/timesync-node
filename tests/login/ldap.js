'use strict';

const chai = require('chai');
const ldapserver = require('./ldapserver');
const LDAP_PORT = 1389;
chai.use(require('chai-passport-strategy'));

module.exports = function(expect, ldapPassport) {
  describe('LDAP login', function() {
    beforeEach(function(done) {
      ldapserver.start(LDAP_PORT, done);
    });

    afterEach(function(done) {
      ldapserver.close(done);
    });

    it('returns user if user exists in LDAP and locally', function(done) {
      chai.passport.use(ldapPassport).success(function(user) {
        // Called when passport successfully logs in
        expect(user.username).to.equal('admin1');
        done();
      }).req(function(req) {
        req.body = {
          auth: {
            type: 'ldap',
            username: 'admin1',
            password: 'valid',
          },
        };
      }).authenticate();
    });

    it('returns error if user exists in LDAP but not locally', function(done) {
      chai.passport.use(ldapPassport).fail(function(challenge) {
        // Called when passport fails to log in
        expect(challenge.message).to.equal('Incorrect username.');
        done();
      }).req(function(req) {
        req.body = {
          auth: {
            type: 'ldap',
            // this user exists in the LDAP mock, but not in the local database
            username: 'james',
            password: 'valid',
          },
        };
      }).authenticate();
    });
  });
};
