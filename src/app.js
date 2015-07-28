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

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var h;

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash('password', salt, function(err, hash) {
        console.log('hash: ' + hash);
        h = hash;
    });
});

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    knex('users').where({username: username}).then(function(users) {
      if (!users) {
        done(null, false, { message: 'Incorrect username.' });
      }
      var user = users[0];

      bcrypt.compare(password, h, function(err, res) {
          if(res) {
            done(null, user);
          }
          else {
            done(null, false, { message: 'Incorrect password.' });
          }
      });


    }).catch(
      function(err) {
        done(err);
      }
    );
  }
));

//Load local functions
require('./routes')(app);
require('./users')(app);
require('./projects')(app);
require('./activities')(app);
require('./times')(app);

app.listen(process.env.PORT || 8000, function() {
    console.log('App now listening on %s', process.env.PORT || 8000);
});
