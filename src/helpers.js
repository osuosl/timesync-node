// src/helpers.js

var app = require('./app');
//var knex = app.get('knex');
var errors = require('./errors');

module.exports = {
    checkUser: function(username, objUser) {
        return new Promise(function(resolve, reject) {
            if (username === objUser) {
                return resolve(userID);
            }else {
                return reject();        
            }
        }
    }
};

