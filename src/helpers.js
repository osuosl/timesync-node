'use strict';

let helpers;

module.exports = function(app) {
  const log = app.get('log');
  helpers = {
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
        // Javascript will cast these to 'undefined' and 'null',
        // which then pass the test
        return false;
      }

      // if slug is only one character long, shortcut and finish
      // rolling this into the alphanumeric test would conflict with
      // getting rid of beginning/ending hyphens
      if (new RegExp('^[a-z]$').test(slug)) {
        return true;
      }

      const hasDoubleHyphens = new RegExp('--');
      const containsLetter = new RegExp('[a-z]+');

      // alphanumeric plus hyphens, but with no external hyphens
      const alphanumeric = new RegExp('^[a-z0-9]+[a-z0-9-]*[a-z0-9]+$');

      return (containsLetter.test(slug) && alphanumeric.test(slug) &&
        !hasDoubleHyphens.test(slug));
    },

    checkUser: function(username, authUser) {
      const knex = app.get('knex');
      return new Promise(function(resolve, reject) {
        if (username === authUser) {
          // .first('id') retrieves and resolves the first record
          // from the query - http://knexjs.org/#Builder-first
          knex('users').first('id').where('username', username)
          .then(function(user) {
            if (user !== undefined) {
              return resolve(user.id);
            }
            return reject();
          }).catch(function(error) {
            log.error('helpers.checkUser', 'Error checking user: ' + error);
          });
        } else {
          return reject();
        }
      });
    },

    validateFields: function(object, fields) {
      /* fields is an array of objects with 'type', 'required' and 'name'
      keys. object is the object containing those fields. The value is
      tested against the type, and if there's a mismatch,
      validateFields returns an object with the type, name, required,
      and actual_type of the field.

      If required is set to true, the field is expected to not be
      undefined. If false, an undefined field will not raise an error.
      */

      /* eslint-disable prefer-const */
      for (let field of fields) {
        /* eslint-enable prefer-const */
        const fieldValue = helpers.getType(object[field.name]);
        if (fieldValue !== field.type) {
          if (object[field.name] === undefined) {
            if (!field.required) {
              // if the field isn't required, and it's undefined,
              // skip it
              continue;
            } else {
              field.missing = true;
              return field;
            }
          }

          field.missing = false;
          field.actualType = fieldValue;
          return field;
        }
      }

      return null;
    },

    checkProject: function(slug) {
      // Bluebird promises take a resolve and a reject
      // essentially, when the data you want is done resolving.
      // pass it to resolve(). If an error occurs, pass it to
      // reject().
      const knex = app.get('knex');
      return new Promise(function(resolve, reject) {
        if (!helpers.validateSlug(slug)) {
          return reject({type: 'invalid', value: slug});
        }

        // get project from database
        knex('projectslugs').select('project').where('name', slug)
        .then(function(project) {
          if (project.length === 0) {
            // project doesn't exist -- it could be null, undefined,
            // invalid, etc.
            reject({type: 'nonexistent', value: slug});
          } else {
            resolve(project[0].project);
          }
        }).catch(function(err) {
          log.error('helpers.checkProject', 'Error requesting project to' +
            ' check: ' + err);
          reject({type: 'database', value: err});
        });
      });
    },

    getType: function(receieved) {
      // typeof returns object for arrays, so we need a special check
      if (typeof receieved === 'object') {
        if (Array.isArray(receieved)) {
          return 'array';
        } else if (receieved === null) {
          return 'null';
        }
        return 'object';
      }
      return typeof receieved;
    },

    checkActivities: function(names) {
      const knex = app.get('knex');
      return new Promise(function(resolve, reject) {
        knex('activities').where('slug', 'in', names).then(function(slugs) {
          if (names === undefined || names === null) {
            reject({type: 'invalid', value: names});
          } else if (names === []) {
            resolve([]);
          } else {
            const results = slugs.map(function(value) {
              return value.slug;
            });

            const unmatched = names.filter(function(value) {
              if (results.indexOf(value) < 0) {
                return value;
              }
            });

            const ids = slugs.map(function(value) {
              return value.id;
            });

            if (unmatched.length === 0) {
              resolve(ids);
            } else {
              reject({type: 'nonexistent', value: unmatched});
            }
          }
        }).catch(function(err) {
          log.error('helpers.checkActivities', 'Error requesting activities ' +
            'to check: ' + err);
          reject({type: 'database', value: err});
        });
      });
    },

    validateUUID: function(uuid) {
      if (typeof uuid !== 'string') {
        return false;
      }

      /* eslint-disable */
      const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
      /* eslint-enable */

      return uuidRegex.test(uuid.toLowerCase());
    },
  };

  return helpers;
};
