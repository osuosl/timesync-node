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
          compiledUser[f] = new Date(rawUser[f]).toISOString().substring(0, 10);
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
        res.send(users.map(function(u) { return compileUser(u); }));
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
      const err = errors.errorInvalidIdentifier('username',
                                                req.params.username);
      return res.status(err.status).send(err);
    }

    // return requested user object
    if (req.query.include_deleted === 'false' ||
        req.query.include_deleted === undefined) {
      compileUsersQueryPromise(req, res, {'deleted_at': null,
                                          'username': req.params.username})
      .then(function(users) {
        if (users.length === 0) {
          const err = errors.errorObjectNotFound('user');
          return res.status(err.status).send(err);
        }

        return res.send(users.map(function(u) {
          return compileUser(u);
        }).pop());
      });
    } else {
      compileUsersQueryPromise(req, res, {'username': req.params.username})
      .then(function(users) {
        if (users.length === 0) {
          const err = errors.errorObjectNotFound('user');
          return res.status(err.status).send(err);
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
      const err = errors.errorBadObjectMissingField('user', 'username');
      return res.status(err.status).send(err);
    }

    // Test to make sure password exists
    if (!user.password) {
      const err = errors.errorBadObjectMissingField('user', 'password');
      return res.status(err.status).send(err);
    }

    // This was a 'forEach, but race conditions === noFun
    /* eslint-disable prefer-const */
    for (let at of ['created_at', 'updated_at', 'deleted_at']) {
    /* eslint-enable prefer-const */
      if (user[at]) {
        const err = errors.errorBadObjectMissingField('user', at + ' field');
        return res.status(err.status).send(err);
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
        const err = errors.errorBadObjectMissingField('user',
        badField.name);
        return res.status(err.status).send(err);
      }
      const err = errors.errorBadObjectInvalidField('user',
      badField.name, badField.type, badField.actualType);
      return res.status(err.status).send(err);
    }

    // Manually check username matches required format
    if (!helpers.validateUsername(user.username)) {
      const err = errors.errorBadObjectInvalidField('user', 'username',
      'valid username', typeof(user.username));
      return res.status(err.status).send(err);
    }

    // Manually check email matches required format
    if (user.email && !helpers.validateEmail(user.email)) {
      const err = errors.errorBadObjectInvalidField('user', 'email',
      'valid email', typeof(user.email));
      return res.status(err.status).send(err);
    }

    // Verify that user is authorized to do this operation
    if (!authUser.site_admin || !authUser.site_manager) {
      const err = errors.errorAuthorizationFailure(authUser.username,
        'create users');
      return res.status(err.status).send(err);
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
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
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
        const err = errors.errorBadObjectMissingField('user', at + ' field');
        return res.status(err.status).send(err);
      }
    }

    // Manually check email matches required format
    if (modUser.email && !helpers.validateEmail(modUser.email)) {
      const err = errors.errorBadObjectInvalidField('user', 'email',
      'valid email', typeof(modUser.email));
      return res.status(err.status).send(err);
    }

    // Verify that user is authorized to do this operation
    if (!(authUser.site_admin || authUser.site_manager ||
         (authUser.username === req.params.username))) {
      const err = errors.errorAuthorizationFailure(authUser.username,
        'modify user ' + req.params.username);
      return res.status(err.status).send(err);
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
        const err = errors.errorBadObjectMissingField('user',
        badField.name);
        return res.status(err.status).send(err);
      }
      const err = errors.errorBadObjectInvalidField('user',
      badField.name, badField.type, badField.actualType);
      return res.status(err.status).send(err);
    }

    knex('users').where({username: req.params.username})
    .then(function(userArr) {
      if (!userArr.length) {
        const err = errors.errorObjectNotFound('user');
        return res.status(err.status).send(err);
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
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving existing slugs: ' + error);
    });
  });

  authRequest.delete(app, app.get('version') + '/users/:username',
  function(req, res, authUser) {
    const knex = app.get('knex');

    if (!helpers.validateUsername(req.params.username)) {
      const err = errors.errorInvalidIdentifier('username',
                                                          req.params.username);
      return res.status(err.status).send(err);
    }

    if (!authUser.site_manager && !authUser.site_admin) {
      const err = errors.errorAuthorizationFailure(authUser.username,
                                                                'delete users');
      return res.status(err.status).send(err);
    }

    knex('users').where({username: req.params.username})
    .then(function(user) {
      if (!user.length) {
        const err = errors.errorObjectNotFound('user');
        return res.status(err.status).send(err);
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
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving existing slugs: ' + error);
    });
  });
};
