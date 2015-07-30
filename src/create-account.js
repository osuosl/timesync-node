#!/usr/bin/env node

//Library requirements
var prompt = require('prompt');
var bcrypt = require('bcrypt');
var knexfile = require('../knexfile');
var db = process.env.DATABASE || 'development';

//Load the database (default = development)
var knex = require('knex')(knexfile[db]);

//Prompt user for their information
var info = {
    properties: {
        name: {
            validator: /^[0-9\w\-\+\@\+\.]{1,30}$/,
            warning: 'Use up to 30 alphanumeric, _, @, +, . and - \n',
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

    //Password encryption
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(result.password, salt, function(err, hash) {
            knex('users').insert({username: result.name, password: hash})
            .then(
                function() {
                    console.log('\nUser successfully created\n');
                })
            //Exits the process after storing user info in the db
            .then(
                function() {
                    process.exit(0);
                });
        });
    });

    console.log('\nCommand-line input received:\n');
    console.log('  Username: ' + result.name);
    console.log('  Password: ' + result.password);
});

