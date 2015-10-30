'use strict';

const APIKeyStrategy = require('passport-localapikey').Strategy;
const loginFunc = require('../login');

module.exports = function(app) {
  return new APIKeyStrategy(
    {
      apiKeyField: 'token',
    },
    function(token, done) {
      /* done parameters: err, user, information
      authentication succeeds if err is null
      and user is not false. */
      const login = loginFunc(app);
      const knex = app.get('knex');

      login.authToken(token).then(function(username) {
        knex('users').where({username: username}).first().then(function(user) {
          if (!user) {
            done(null, false, { message: 'Bad API token' });
          } else {
            done(null, user);
          }
        }).catch(function(err) {
          done(err);
        });
      }).catch(function(error) {
        done(null, false, error);
      });
    }
  );
};
