var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var knexfile = require('../../knexfile');
var db = process.env.DATABASE || 'development';

//Load the database (default to development)
var knex = require('knex')(knexfile[db]);

module.exports = function() {
    return new LocalStrategy(
        function(username, password, done) {
            knex('users').where({username: username}).then(function(users) {
                if (users.length === 0) {
                    done(null, false, { message: 'Incorrect username.' });
                } else {
                    var user = users[0];
                    bcrypt.compare(password, user.password, function(err, res) {
                        if (res) {
                            done(null, user);
                        } else {
                            done(null, false, {
                                message: 'Incorrect password.'
                            });
                        }
                    });
                }
            }).catch(
              function(err) {
                  done(err);
              }

            );
        }

  );
};
