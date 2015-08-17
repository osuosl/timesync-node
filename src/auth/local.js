var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

module.exports = function(knex) {
    return new LocalStrategy(
        {
            usernameField: 'auth[username]',
            passwordField: 'auth[password]'
        },
        function(username, password, done) {
            /* done parameters: err, user, information
               authentication succeeds if err is null
               and user is not false. */
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

            }).catch(/* istanbul ignore next */ function(err) {
                done(err);
            });
        }

    );
};
