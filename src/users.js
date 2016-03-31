'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const authRequest = require('./authenticatedRequest');
  const log = app.get('log');


  function compileUser(rawUser) {
    const strings = ['display_name', 'username', 'email', 'meta'];
    const bools = ['site_spectator', 'site_manager', 'site_admin', 'active'];
    const times = ['updated_at', 'deleted_at', 'created_at'];
    const fields = strings.concat(bools).concat(times);

    const compiledUser = {};

    fields.forEach(function(f) {
      if (typeof(rawUser[f]) === 'undefined' || rawUser[f] === null) {
        compiledUser[f] = null;
      } else {
        // The field being iterated on is a string type
        if (strings.indexOf(f) > -1) {
          compiledUser[f] = rawUser[f];

        // The field being iterated on is true/false
        } else if (bools.indexOf(f) > -1) {
          compiledUser[f] = Boolean(rawUser[f]);

        // The field being iterated on is a date-time
        } else if (times.indexOf(f) > -1) {
          if (helpers.validateDate(rawUser[f])) {
            compiledUser[f] = new Date(rawUser[f]).toISOString()
                                                              .substring(0, 10);
          } else {
            const date = new Date();
            date.setTime(+rawUser[f]);
            compiledUser[f] = date.toISOString().substring(0, 10);
          }
        }
      }
    });

    return compiledUser;
  }


  function compileUsersQueryPromise(req, res, additional) {
    return new Promise(function(resolve) {
      const knex = app.get('knex');

      let usersQ = knex('users');
      if (typeof(additional) === 'object') {
        usersQ = usersQ.where(additional);
      }

      return resolve(usersQ);
    });
  }


  authRequest.get(app, app.get('version') + '/users', function(req, res) {
    if (req.query.include_deleted === 'false' ||
        req.query.include_deleted === undefined) {
      compileUsersQueryPromise(req, res, {'deleted_at': null})
      .then(function(users) {
        const result = users.map(function(u) { return compileUser(u); });
        res.send(result);
      });
    } else {
      compileUsersQueryPromise(req, res, undefined).then(function(users) {
        res.send(users.map(function(u) { return compileUser(u); }));
      });
    }
  });


  authRequest.get(app, app.get('version') + '/users/:username',
  function(req, res) {
    // Check for valid :username
    if (!helpers.validateUsername(req.params.username)) {
      return errors.send(errors.errorInvalidIdentifier('username',
                                                req.params.username), res);
    }

    // return requested user object
    if (req.query.include_deleted === 'false' ||
        req.query.include_deleted === undefined) {
      compileUsersQueryPromise(req, res, {'deleted_at': null,
                                          'username': req.params.username})
      .then(function(users) {
        if (users.length === 0) {
          return errors.send(errors.errorObjectNotFound('user'), res);
        }

        return res.send(users.map(function(u) {
          return compileUser(u);
        }).pop());
      });
    } else {
      compileUsersQueryPromise(req, res, {'username': req.params.username})
      .then(function(users) {
        if (users.length === 0) {
          return errors.send(errors.errorObjectNotFound('user'), res);
        }

        return res.send(users.map(function(u) {
          return compileUser(u);
        }).pop());
      });
    }
  });


  authRequest.post(app, app.get('version') + '/users',
  function(req, res, authUser) {
    const knex = app.get('knex');
    const user = req.body.object;

    // test to make sure username exists
    if (!user.username) {
      return errors.send(errors.errorBadObjectMissingField('user', 'username'),
        res);
    }

    // Test to make sure password exists
    if (!user.password) {
      return errors.send(errors.errorBadObjectMissingField('user', 'password'),
        res);
    }

    // This was a 'forEach, but race conditions === noFun
    /* eslint-disable prefer-const */
    for (let at of ['created_at', 'updated_at', 'deleted_at']) {
    /* eslint-enable prefer-const */
      if (user[at]) {
        return errors.send(errors.errorBadObjectMissingField('user',
          at + ' field'), res);
      }
    }

    // Test to make sure all fields are of the correct time and exist
    const badField = helpers.validateFields(user, [
      {name: 'username', type: 'string', required: true},
      {name: 'display_name', type: 'string', required: false},
      {name: 'password', type: 'string', required: true},
      {name: 'email', type: 'string', required: false},
      {name: 'site_spectator', type: 'boolean', required: false},
      {name: 'site_manager', type: 'boolean', required: false},
      {name: 'site_admin', type: 'boolean', required: false},
      {name: 'active', type: 'boolean', required: false},
      {name: 'meta', type: 'string', required: false},
    ]);

    // Act on any bad field found
    if (badField) {
      if (badField.actualType === 'undefined') {
        return errors.send(errors.errorBadObjectMissingField('user',
          badField.name), res);
      }
      return errors.send(errors.errorBadObjectInvalidField('user',
        badField.name, badField.type, badField.actualType), res);
    }

    // Manually check username matches required format
    if (!helpers.validateUsername(user.username)) {
      return errors.send(errors.errorBadObjectInvalidField('user', 'username',
        'valid username', typeof(user.username)), res);
    }

    // Manually check email matches required format
    if (user.email && !helpers.validateEmail(user.email)) {
      return errors.send(errors.errorBadObjectInvalidField('user', 'email',
        'valid email', typeof(user.email)), res);
    }

    // Verify that user is authorized to do this operation
    if (!authUser.site_admin || !authUser.site_manager) {
      return errors.send(errors.errorAuthorizationFailure(authUser.username,
        'create users'), res);
    }

    knex.transaction(function(trx) {
      user.created_at = Date.now();
      trx('users').insert(user).then(function() {
        trx.commit();

        // manually set fields if they are not already set.
        const nullFields = ['username', 'display_name', 'password', 'email',
        'meta', 'created_at', 'updated_at', 'deleted_at'];
        nullFields.forEach(function(f) {
          if (!user[f]) { user[f] = null; }
        });

        // ... more of that ...
        const boolFields = ['site_spectator', 'site_manager', 'site_admin'];
        boolFields.forEach(function(f) {
          if (!user[f]) { user[f] = false; }
        });

        // .. almost done...
        if (!user.active) { user.active = true; }

        // Don't send your password!
        delete(user.password);

        return res.send(JSON.stringify(user));
      }).catch(function(error) {
        log.error(req, 'Error inserting user entry: ' + error);
        trx.rollback();
      });
    }).catch(function(error) {
      log.error(req, 'Rolling back transaction.');
      return errors.send(errors.errorServerError(error));
    });
  });


  authRequest.post(app, app.get('version') + '/users/:username',
  function(req, res, authUser) {
    const knex = app.get('knex');
    const modUser = req.body.object;

    /* eslint-disable prefer-const */
    for (let at of ['created_at', 'updated_at', 'deleted_at', 'username']) {
    /* eslint-enable prefer-const */
      if (modUser[at]) {
        return errors.send(errors.errorBadObjectMissingField('user',
          at + ' field'), res);
      }
    }

    // Manually check email matches required format
    if (modUser.email && !helpers.validateEmail(modUser.email)) {
      return errors.send(errors.errorBadObjectInvalidField('user', 'email',
      'valid email', typeof(modUser.email)), res);
    }

    // Verify that user is authorized to do this operation
    if (!(authUser.site_admin || authUser.site_manager ||
         (authUser.username === req.params.username))) {
      return errors.send(errors.errorAuthorizationFailure(authUser.username,
        'modify user ' + req.params.username), res);
    }

    // Test to make sure all fields are of the correct time and exist
    const badField = helpers.validateFields(modUser, [
      {name: 'display_name', type: 'string', required: false},
      {name: 'password', type: 'string', required: false},
      {name: 'site_spectator', type: 'boolean', required: false},
      {name: 'site_manager', type: 'boolean', required: false},
      {name: 'site_admin', type: 'boolean', required: false},
      {name: 'active', type: 'boolean', required: false},
      {name: 'meta', type: 'string', required: false},
    ]);

    // Act on any bad field found
    if (badField) {
      if (badField.actualType === 'undefined') {
        return errors.send(errors.errorBadObjectMissingField('user',
          badField.name), res);
      }
      return errors.send(errors.errorBadObjectInvalidField('user',
        badField.name, badField.type, badField.actualType), res);
    }

    knex('users').where({username: req.params.username})
    .then(function(userArr) {
      if (!userArr.length) {
        return errors.send(errors.errorObjectNotFound('user'), res);
      }

      knex.transaction(function(trx) {
        const user = userArr.pop();

        /* eslint-disable guard-for-in */
        /* eslint-disable prefer-const */
        for (let field in modUser) {
        /* eslint-enable prefer-const */
          user[field] = modUser[field];
        }
        /* eslint-enable guard-for-in */

        user.created_at = +user.created_at;
        user.updated_at = Date.now();
        user.deleted_at = null;
        delete(user.id);

        trx('users').where({username: req.params.username}).update(user)
        .returning('id').then(function() {
          trx.commit();

          delete(user.password);

          /* eslint-disable prefer-const */
          for (let b of ['site_admin', 'site_manager', 'site_spectator',
                                                                  'active']) {
          /* eslint-enable prefer-const */
            user[b] = Boolean(user[b]);
          }

          /* eslint-disable prefer-const */
          for (let t of ['updated_at', 'created_at', 'deleted_at']) {
          /* eslint-enable prefer-const */
            if (user[t]) {
              user[t] = new Date(user[t]).toISOString().substring(0, 10);
            }
          }

          return res.send(JSON.stringify(user));
        }).catch(function(error) {
          log.error(req, 'Error inserting user entry: ' + error);
          trx.rollback();
        });
      }).catch(function(error) {
        log.error(req, 'Rolling back transaction.');
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving existing slugs: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });

  authRequest.delete(app, app.get('version') + '/users/:username',
  function(req, res, authUser) {
    const knex = app.get('knex');

    if (!helpers.validateUsername(req.params.username)) {
      return errors.send(errors.errorInvalidIdentifier('username',
                                                    req.params.username), res);
    }

    if (!authUser.site_manager && !authUser.site_admin) {
      return errors.send(errors.errorAuthorizationFailure(authUser.username,
                                                          'delete users'), res);
    }

    knex('users').where({username: req.params.username})
    .then(function(user) {
      if (!user.length) {
        return errors.send(errors.errorObjectNotFound('user'));
      }

      knex.transaction(function(trx) {
        const deletedUser = user.pop();
        deletedUser.updated_at = Date.now();
        deletedUser.deleted_at = Date.now();
        delete(deletedUser.id);

        trx('users').where({username: req.params.username})
        .update(deletedUser).returning('id').then(function() {
          trx.commit();

          return res.send();
        }).catch(function(error) {
          log.error(req, 'Error inserting user entry: ' + error);
          trx.rollback();
        });
      }).catch(function(error) {
        log.error(req, 'Rolling back transaction.');
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving existing user: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });
};
