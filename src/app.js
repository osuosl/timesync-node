//Library requirements
var express = require('express');
var bodyParser = require('body-parser');
var knexfile = require('../knexfile');
var db = process.env.DATABASE || 'development';

//Load the database (default to development)
var knex = require('knex')(knexfile[db]);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);

// Set API version prefix
app.set('version', '/v1');

// Set up authentication
var passport = require('passport');
var localPassport = require('./auth/local.js')(knex);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(localPassport);

//Load local functions
require('./projects')(app);
require('./activities')(app);
require('./times')(app);

module.exports = app;

app.listen(process.env.PORT || 8000, function() {
    console.log('App now listening on %s', process.env.PORT || 8000);
});
