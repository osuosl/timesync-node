'use strict';

const LdapStrategy = require('passport-ldapauth');

module.exports = function(app) {
  const log = app.get('log');
  return new LdapStrategy({
    server: {
      url: process.env.TIMESYNC_LDAP_URL,
      searchBase: process.env.TIMESYNC_LDAP_SEARCH_BASE,
      searchFilter: '(uid={{username}})',
    },
    usernameField: 'auth[username]',
    passwordField: 'auth[password]',
  }, function(ldapUser, done) {
    const knex = app.get('knex');
    knex('users').where({username: ldapUser.uid}).first().then(function(user) {
      if (!user) {
        done(null, false, { message: 'Incorrect username.' });
      } else {
        done(null, user);
      }
    }).catch(function(err) {
      log.error('auth/ldap.js', 'Error loading user from LDAP database.');
      done(err);
    });
  });
};
