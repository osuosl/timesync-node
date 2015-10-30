'use strict';
/* eslint-disable no-console */

// Library requirements
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';
let auth;

if (process.env.TIMESYNC_AUTH_MODULES === undefined) {
  auth = ['password'];
} else {
  try {
    auth = JSON.parse(process.env.TIMESYNC_AUTH_MODULES);
  } catch (e) {
    console.log('Invalid TIMESYNC_AUTH_MODULES variable!', e);
    process.exit(1);
  }
}

if (!Array.isArray(auth)) {
  console.log('TIMESYNC_AUTH_MODULES must be array of auth modules!');
  process.exit(1);
}


const knex = require('knex')(knexfile[db]);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SECRET_KEY));
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
if (auth.indexOf('ldap') > -1) {
  const ldapStrategy = require('./auth/ldap')(app);
  passport.use(ldapStrategy);
  app.get('strategies').push('ldapauth');
}

if (auth.indexOf('password') > -1) {
  const localStrategy = require('./auth/local')(app);
  passport.use(localStrategy);
  app.get('strategies').push('local');
}

// Don't register because it's invalid on login
passport.use(require('./auth/token')(app));

// Load local functions
require('./projects')(app);
require('./activities')(app);
require('./times')(app);
require('./login')(app);

module.exports = app;

app.listen(process.env.PORT || 8000, function notifyUser() {
  console.log('App now listening on %s', process.env.PORT || 8000);
});
