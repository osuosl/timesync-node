'use strict';
const errors = require('./errors');
const passport = require('passport');

module.exports = function(app, path, callback) {
  app.post(path, function(req, res, next) {
    let authType;
    if (req.body.auth.type === 'password') {
      authType = 'local';
    } else if (req.body.auth.type === 'ldap') {
      authType = 'ldapauth';
    }

    if (app.get('strategies').indexOf(authType) < 0) {
      const err = errors.errorAuthenticationTypeFailure(req.body.auth.type);
      return res.status(err.status).send(err);
    }

    const caller = function(autherr, user, info) {
      if (!user) {
        const err = errors.errorAuthenticationFailure(info.message);
        return res.status(err.status).send(err);
      }
      callback(req, res, user);
    };

    passport.authenticate(authType, caller)(req, res, next);
  });
};
