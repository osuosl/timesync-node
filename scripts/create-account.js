'use strict';

// To start the script, run 'npm run create-account'

// Library requirements
const prompt = require('prompt');
const yargs = require('yargs');
const bcrypt = require('bcrypt');
const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';

// Load the database (default = development)
const knex = require('knex')(knexfile[db]);

// Prompt user for their information
const info = {
  properties: {
    'user': {
      description: 'TimeSync root username',
      // Note: '\w' matches all alphanumeric char and '_'
      pattern: /^[\w\-\~\.\_]{1,30}$/,
      message: 'Use up to 30 alphanumeric, _, ~, . and - \n',
      required: true,
    },
    'password': {
      description: 'TimeSync root password',
      hidden: true,
      required: true,
    },
  },
};

function onErr(err) {
  console.error(err);
  return 1;
}

const argv = yargs
            .usage('Usage: $0 [options]')
            .example('$0 -u root -p root_pass')
            .alias('u', 'user')
            .nargs('u', 1)
            .describe('u', 'Root account username')
            .alias('p', 'password')
            .nargs('p', 1)
            .describe('p', 'Root account password')
            .help('h')
            .alias('h', 'help')
            .argv;

prompt.override = argv;

prompt.start();

knex('users').select('id').then(function(userIds) {
  if (userIds.length > 0) {
    process.exit(0);
  }

  prompt.get(info, function handleInput(promptErr, result) {
    if (promptErr) {
      return onErr(promptErr);
    }

    // Password encryption
    bcrypt.genSalt(10, function hashPassword(genSaltErr, salt) {
      bcrypt.hash(result.password, salt,
      function createUser(hashErr, hash) {
        knex('users').insert({
          username: result.user,
          password: hash,
          display_name: 'root',
          email: null,
          site_spectator: true,
          site_manager: true,
          site_admin: true,
          active: true,
          created_at: Date.now(),
          updated_at: null,
          deleted_at: null,
          meta: 'Root user. Created automatically. Use to create other users.',
        })
        .then(
          function userCreated() {
            console.log('\nUser successfully created\n');
          }
        )
        /* If the user enters a duplicate name, information will not be
           added to the database. An error message will print to the screen
           and the process will exit. */
        .catch(
          function handleKnexError(err) {
            if (err.errno === 19) {
              console.log('\nINVALID ENTRY: That username is ' +
                'already in use, please choose a ' +
                'different handle\n');
              process.exit(0);
            } else if (err.errno === 1) {
              console.log('\nDoes your database exist?\n');
              process.exit(0);
            } else {
              // NOTE: DON'T IGNORE - This will need to be fixed
              // later to work on databases other than sqlite
                /* If the error that occurs is not a constraint
                 violation, an error message will print to the screen
                 with a link to a list of result codes. The errno is
                 also printed to the screen. */

              console.log('\nSomething went wrong! Check out ' +
                'https://www.sqlite.org/c3ref/' +
                'c_abort.html to figure out what ' +
                'happened.\n');
              console.log('  Your error number is: ' + err.errno +
                '\n');
            }
          })
        // Exits the process after storing user info in the db.
        .then(
          function quit() {
            process.exit(0);
          }
        );
      });
    });
  });
});
