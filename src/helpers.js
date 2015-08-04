// src/helpers.js

var app = require('./app');
var knex = app.get('knex');

module.exports = {
    checkUser: function(username, authUser) {
        return new Promise(function(resolve, reject) {
            if (username === authUser) {
                // .first('id') retrieves and resolves the first record
                // from the query - http://knexjs.org/#Builder-first
                knex('users').first('id')
                .where('username', username).then(function(users) {
                    return resolve(users.id);
                });
            }else {
                return reject();
            }
        });
    }
};

