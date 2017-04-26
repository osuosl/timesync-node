'use strict';
/* eslint-disable no-console */

// Library requirements
require('dotenv-expand')(require('dotenv').config());
const express = require('express');
const bodyParser = require('body-parser');
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

const Log = require('log');
const Ain = require('ain2');
const fs = require('fs');

const helmet = require('helmet');

const log = require('./log')(Log, Ain, fs);

const app = express();
app.use(helmet()); // Set a variety of HTTP headers to improve security
app.use(helmet.noCache()); // Disallow all caching; not set by default
app.use(helmet.contentSecurityPolicy({ // Set a CSP; not set by default
  directives: {
    defaultSrc: ['none'], // Disallow any data to come from the TS server
    scriptSrc: ['self'], // Except scripts and AJAX requests
    connectSrc: ['self'], // To prevent MITM and XSS attacks
    // reportUri: '/', // Consider adding in the future
  },
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);
app.set('log', log);

app.use(require('cors')());

const errors = require('./errors');

/*
 * Catch errors due to malformed or invalid JSON in request bodies and
 * return a 400 error
 */
app.use(function(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400) {
    return errors.send(errors.errorBadObjectInvalidObject(), res);
  }
  next();
});

// Set API version prefix
app.set('version', '/v0');

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

// Access logging
app.use(function(req, res, next) {
  res.on('finish', function() {
    log.access(req, res);
  });
  next();
});

// Load local functions
require('./projects')(app);
require('./activities')(app);
require('./times')(app);
require('./login')(app);
require('./users')(app);

module.exports = app;

app.listen(process.env.PORT || 8000, function notifyUser() {
  console.log('App now listening on %s', process.env.PORT || 8000);
});
