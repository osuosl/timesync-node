'use strict';

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(knex) {
  return new LocalStrategy(
    {
      usernameField: 'auth[username]',
      passwordField: 'auth[password]',
    },
    function(username, password, done) {
      /* done parameters: err, user, information
      authentication succeeds if err is null
      and user is not false. */
      knex('users').where({username: username}).first().then(function(user) {
        if (!user) {
          done(null, false, { message: 'Incorrect username.' });
        } else {
          bcrypt.compare(password, user.password, function(err, res) {
            if (res) {
              done(null, user);
            } else {
              done(null, false, { message: 'Incorrect password.' });
            }
          });
        }
      }).catch(function(err) {
        done(err);
      });
    }

  );
};
