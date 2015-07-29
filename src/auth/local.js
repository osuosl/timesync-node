var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

module.exports = new LocalStrategy(
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
);