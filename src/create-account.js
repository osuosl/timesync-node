#!/usr/bin/env node

//Library requirements
var prompt = require('prompt');
var bcrypt = require('bcrypt');
var knexfile = require('../knexfile');
var db = process.env.DATABASE || 'development';

//Load the database (default = development)
var knex = require('knex')(knexfile[db]);


var info = {
    properties: {
        name: {
            validator: /^[0-9a-zA-Z\-]+$/,
            warning: 'Use only letters, numbers, or dashes',
            required: true
        },
        password: {
            //hidden: true,
            required: true
        }
    }
};

function onErr(err) {
    console.log(err);
    return 1;
}

prompt.start();

prompt.get(info, function(err, result) {
    if (err) { return onErr(err); }

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(result.password, salt, function(err, hash) {
            knex('users').insert({username: result.name, password: hash})
            .then(
                function() {
                    console.log('done');
                })
            .then(
                function() {
                    process.exit(0);
                });
        });
    });

    console.log('Command-line input received:');
    console.log('  Username: ' + result.name);
    console.log('  Password: ' + result.password);
});

