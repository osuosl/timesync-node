var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

module.exports = function(knex) {
  return new LocalStrategy(
    function(username, password, done) {
      knex('users').then(function(users) {
        if (users.length === 0) {
          done(null, false, { message: 'Incorrect username.' });
        }
        var user = users[0];
        console.log(users);

        bcrypt.compare(password, user.password, function(err, res) {
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
};