'use strict';
const errors = require('./errors');
const passport = require('passport');

module.exports = {
  post: function(app, path, callback) {
    app.post(path, function(req, res, next) {
      if (!req.body.auth) {
        return errors.send(errors.errorAuthenticationFailure(
          'Missing credentials'), res);
      }

      if (!req.body.auth.type) {
        return errors.send(errors.errorAuthenticationFailure(
          'Authentication type required'), res);
      }

      if (req.body.auth.type !== 'token') {
        return errors.send(errors.errorAuthenticationTypeFailure(
          req.body.auth.type), res);
      }

      if (!req.body.auth.token) {
        return errors.send(errors.errorAuthenticationFailure(
          'Missing credentials'), res);
      }

      /*
       * Unfortunately, we can only declare the token to be in "token" (as in
       * a GET request) or in "auth[token]" (as in a POST), but not both. So we
       * need to strip away the auth block and put the token directly in the
       * object in order to get auth to work.
       */
      req.body.token = req.body.auth.token;
      delete req.body.auth;

      const caller = function(autherr, user, info) {
        if (!user) {
          return errors.send(errors.errorAuthenticationFailure(autherr ||
                                                              info.message ||
                                                              'Unknown error'),
                                                              res);
        }
        callback(req, res, user);
      };

      passport.authenticate('localapikey', caller)(req, res, next);
    });
  },

  get: function(app, path, callback) {
    app.get(path, function(req, res, next) {
      if (!req.query.token) {
        return errors.send(errors.errorAuthenticationFailure(
          'Missing credentials'), res);
      }

      const caller = function(autherr, user, info) {
        if (!user) {
          return errors.send(errors.errorAuthenticationFailure(autherr ||
                                                              info.message ||
                                                              'Unknown error'),
                                                              res);
        }
        callback(req, res, user);
      };

      passport.authenticate('localapikey', caller)(req, res, next);
    });
  },

  delete: function(app, path, callback) {
    app.delete(path, function(req, res, next) {
      if (!req.query.token) {
        return errors.send(errors.errorAuthenticationFailure(
          'Missing credentials'), res);
      }

      const caller = function(autherr, user, info) {
        if (!user) {
          return errors.send(errors.errorAuthenticationFailure(autherr ||
                                                              info.message ||
                                                              'Unknown error'),
                                                              res);
        }
        callback(req, res, user);
      };

      passport.authenticate('localapikey', caller)(req, res, next);
    });
  },
};
