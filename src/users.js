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
      if(typeof(rawUser[f]) === 'undefined' || rawUser[f] === null) {
        compiledUser[f] = null;
      } else {

        // The field being iterated on is a string type
        if(strings.indexOf(f) > -1) {
          compiledUser[f] = rawUser[f];

        // The field being iterated on is true/false
        } else if(bools.indexOf(f) > -1) {
          compiledUser[f] = Boolean(rawUser[f]);

        // The field being iterated on is a date-time
        } else if(times.indexOf(f) > -1) {
          compiledUser[f] = new Date(rawUser[f])
                                    .toISOString()
                                    .substring(0, 10);
        }
      }
    });

    return compiledUser;
  }


  function compileUsersQueryPromise(req, res, additional) {
    return new Promise(function(resolve, reject) {
      const knex = app.get('knex');

      let usersQ = knex('users');
      if (typeof(additional) === 'object') {
        usersQ = usersQ.where(additional);
        return resolve(usersQ);
      } else {
        return resolve(usersQ);
      }

      // I know for a fact that this should have an associated 'reject'
      // condition...
      // I also have no idea what that condition should be.
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
        } else {
          return res.send(users.map(function(u) { return compileUser(u); }).pop());
        }
      });
    } else {
      compileUsersQueryPromise(req, res, {'username': req.params.username})
      .then(function(users) {
        if (users.length === 0) {
          const err = errors.errorObjectNotFound('user');
          return res.status(err.status).send(err);
        } else {
          return res.send(users.map(function(u) { return compileUser(u); }).pop());
        }
      });
    }
  });


  authRequest.post(app, app.get('version') + '/users', function(req, res) {

  });


  authRequest.post(app, app.get('version') + '/users/:username',
  function(req, res) {

  });


  app.delete(app.get('version') + '/times/:uuid', function(req, res) {

  });
};
