// To start the script, run 'npm run create-account'

// Library requirements
var prompt = require('prompt');
var bcrypt = require('bcrypt');
var knexfile = require('../knexfile');
var db = process.env.DATABASE || 'development';

// Load the database (default = development)
var knex = require('knex')(knexfile[db]);

// Prompt user for their information
var info = {
  properties: {
    name: {
      // Note: '\w' matches all alphanumeric char and '_'
      validator: /^[\w\-\+\@\+\.]{1,30}$/,
      warning: 'Use up to 30 alphanumeric, _, @, +, . and - \n',
      required: true
    },
    password: {
      hidden: true,
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

  // Password encryption
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(result.password, salt, function(err, hash) {
      knex('users').insert({username: result.name, password: hash})
      .then(function() {
        console.log('\nUser successfully created\n');
      })
      /* If the user enters a duplicate name, information will not be
      added to the database. An error message will print to the screen
      and the process will exit. */
      .catch(function(err) {
        var errno = err.errno;
        if (errno === 19) {
          console.log('\nINVALID ENTRY: That username is already in use, ' +
          'please choose a different handle\n');
          process.exit(0);

        } else if (errno === 1) {
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
          'https://www.sqlite.org/c3ref/c_abort.html to figure out what ' +
          'happened.\n');
          console.log('  Your error number is: ' + err.errno + '\n');
        }
      })
      // Exits the process after storing user info in the db.
      .then(function() {
        process.exit(0);
      });
    });
  });
});
