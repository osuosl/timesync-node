// src/helpers.js

var app = require('./app');
var knex = app.get('knex');
var errors = require('./errors');

module.exports = {
    checkActivities: function(names) {
        var valid = [];
        for (var i = 0; i < names.length - 1; i++){
            knex('activities').where({slug:names[i]}).then(function(slug){
               console.log(slug/* + ' Name: ' + names[i]*/);
               if (names[i] === slug.name){
                   valid.append(slug.id);
                   console.log('Valid slug found for ' + slug);
               }
            });
        }
        if (valid == names.length - 1){
            console.log('Valid slugs');
            //res.send(true);
            return slug.id;
        }
        return false;
    }
};
