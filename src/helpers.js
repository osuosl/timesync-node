// src/helpers.js

var app = require('./app');
//var knex = app.get('knex');
var errors = require('./errors');

module.exports = {
    checkUser: function(username, objUser) {
        if (username == objUser) {
            return true;
        }
        if (username !== objUser) {
            console.log('An error has occurred');
            return false;
        }
    }
};

