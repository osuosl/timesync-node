// src/helpers.js

var app = require('./app');
var knex = app.get('knex');
var errors = require('./errors');

module.exports = {
    checkUser: function(username, objUser) {
        return new Promise(function(resolve, reject) {
            if (username === objUser) {
                knex('users').select('id')
                .where('username', username).then(function(users) {
                    /* Knex only returns lists and not single items. 'users'
                       is a list with a single item. Hence, we use an index of
                       zero to retrieve that single item */
                    return resolve(users[0].id); 
                });
            }else {
                return reject();        
            }
        });
    }
};

