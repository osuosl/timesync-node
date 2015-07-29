#!/usr/bin/env node

var prompt = require('prompt');


var info = {
    properties: {
        name: {
            validator: /^[0-9a-zA-Z\-]+$/,
            message: 'Username can contain only letters, numbers, or dashes',
            warning: 'Invalid entry',
            required: true
        },
        password: {
            //hidden: true,
            //validator:
            //message:
            required: true
        }
    }
};

prompt.start();

prompt.get(info, function (err, result){
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.name);
    console.log('  Password: ' + result.password);
});

function onErr(err) {
    console.log(err);
    return 1;
}

//console.log('Arguments:', process.argv.length);  
//console.log(process.argv);
