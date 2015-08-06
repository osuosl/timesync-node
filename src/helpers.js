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

        var hasDoubleHyphens = new RegExp('--');
        var containsLetter = new RegExp('[a-z]+');
        var alphanumeric = new RegExp('^[a-z0-9-]*$'); // also allows hyphen

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
    }
};
