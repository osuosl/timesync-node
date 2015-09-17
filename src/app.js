'use strict';
/* eslint-disable no-console */

// Library requirements
const express = require('express');
const bodyParser = require('body-parser');
const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';

const knex = require('knex')(knexfile[db]);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);

// Set API version prefix
app.set('version', '/v1');

// Set up authentication
const passport = require('passport');
const localPassport = require('./auth/local.js')(app);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function serializeCallback(user, done) {
  done(null, user);
});

passport.deserializeUser(function deserializeCallback(user, done) {
  done(null, user);
});

passport.use(localPassport);

// Load local functions
require('./projects')(app);
require('./activities')(app);
require('./times')(app);

module.exports = app;

app.listen(process.env.PORT || 8000, function notifyUser() {
  console.log('App now listening on %s', process.env.PORT || 8000);
});
