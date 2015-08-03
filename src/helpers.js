// src/helpers.js

var app = require('./app');
//var knex = app.get('knex');
var errors = require('./errors');

module.exports = {
    checkUser: function(username, objUser)
        .then(function(){
            if (username == objUser) {
                return true;
            }
        })
        .catch(function(){
            if (username !== objUser) {
                return false;
            }
        })
};

