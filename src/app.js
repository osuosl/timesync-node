'use strict';

// Library requirements
const express = require('express');
const bodyParser = require('body-parser');
const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';

let knex;
if (!GLOBAL.knex) {
  // Load the database (default to development)
  knex = require('knex')(knexfile[db]);
} else {
  // use the knex connection initiated from inside the testing
  // environment
  knex = GLOBAL.knex;
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);

// Set API version prefix
app.set('version', '/v1');

// Set up authentication
const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function serializeCallback(user, done) {
  done(null, user);
});

passport.deserializeUser(function deserializeCallback(user, done) {
  done(null, user);
});

app.set('strategies', []);
if (process.env.TIMESYNC_LDAP) {
  const ldapStrategy = require('./auth/ldap')(knex);
  passport.use(ldapStrategy);
  app.get('strategies').push('ldapauth');
}

if (process.env.TIMESYNC_LOCAL) {
  const localStrategy = require('./auth/local')(knex);
  passport.use(localStrategy);
  app.get('strategies').push('local');
}

// Load local functions
require('./projects')(app);
require('./activities')(app);
require('./times')(app);

module.exports = app;

app.listen(process.env.PORT || 8000, function notifyUser() {
  /* eslint-disable */
  console.log('App now listening on %s', process.env.PORT || 8000);
  /* eslint-enable */
});
