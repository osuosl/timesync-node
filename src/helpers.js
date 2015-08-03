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
                    //
                    return resolve(users[0].id); 
                });
            }else {
                return reject();        
            }
        });
    }
};

