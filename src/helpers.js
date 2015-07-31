var app = require('./app');
var knex = app.get('knex');

module.exports = {
    validateSlug: function(slug) {
        /* matches:
          1. at least one letter
          2. any number of alphanumeric
          3. hyphen-separated sets of alphanumeric

          Valid:
            test
            a1b2-c3
            1a2b

          Invalid:
            a1b2--c3
        */
        if (slug === undefined || slug === null) {
            // Javascript will cast these to "undefined" and "null",
            // which then pass the test
            return false;
        }

        // if slug is only one character long, shortcut and finish
        // rolling this into the alphanumeric test would conflict with
        // getting rid of beginning/ending hyphens
        if (RegExp('^[a-z]$').test(slug)) {
            return true;
        }

        var hasDoubleHyphens = new RegExp('--');
        var containsLetter = new RegExp('[a-z]+');

        // alphanumeric plus hyphens, but with no external hyphens
        var alphanumeric = new RegExp('^[a-z0-9]+[a-z0-9-]*[a-z0-9]+$');

        return (containsLetter.test(slug) &&
                alphanumeric.test(slug) &&
                !hasDoubleHyphens.test(slug));
    },

    checkUser: function(username, authUser) {
        return new Promise(function(resolve, reject) {
            if (username === authUser) {
                // .first('id') retrieves and resolves the first record
                // from the query - http://knexjs.org/#Builder-first
                knex('users').first('id')
                .where('username', username).then(function(user) {
                    return resolve(user.id);
                });
            }else {
                return reject();
            }
        });
    },

    checkProject: function(slug) {
      // Bluebird promises take a resolve and a reject
      // essentially, when the data you want is done resolving.
      // pass it to resolve(). If an error occurs, pass it to
      // reject().
      return new Promise(function(resolver, reject) {
          // get project from database
          knex('projectslugs').select('project')
          .where('name', slug).then(function(project) {
              if(project.length == 0) {
                  // project doesn't exist -- it could be null, undefined,
                  // invalid, etc.
                  reject(slug);
              } else {
                  resolver(project[0].project);
              }
          }).catch(function(err) { reject(err) });
      });
    }
};
