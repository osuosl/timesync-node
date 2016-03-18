'use strict';
const errors = require('./errors');
const passport = require('passport');

module.exports = {
  post: function(app, path, callback) {
    app.post(path, function(req, res, next) {
      if (!req.body.auth) {
        const err = errors.errorAuthenticationFailure('Missing credentials');
        return res.status(err.status).send(err);
      }

      if (!req.body.auth.type) {
        const err = errors.errorAuthenticationFailure(
          'Authentication type required');
        return res.status(err.status).send(err);
      }

      if (req.body.auth.type !== 'token') {
        const err = errors.errorAuthenticationTypeFailure(req.body.auth.type);
        return res.status(err.status).send(err);
      }

      if (!req.body.auth.token) {
        const err = errors.errorAuthenticationFailure('Missing credentials');
        return res.status(err.status).send(err);
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
          const err = errors.errorAuthenticationFailure(autherr ||
                                                        info.message ||
                                                        'Unknown error');
          return res.status(err.status).send(err);
        }
        callback(req, res, user);
      };

      passport.authenticate('localapikey', caller)(req, res, next);
    });
  },

  get: function(app, path, callback) {
    app.get(path, function(req, res, next) {
      if (!req.query.token) {
        const err = errors.errorAuthenticationFailure('Missing credentials');
        return res.status(err.status).send(err);
      }

      const caller = function(autherr, user, info) {
        if (!user) {
          const err = errors.errorAuthenticationFailure(autherr ||
                                                        info.message ||
                                                        'Unknown error');
          return res.status(err.status).send(err);
        }
        callback(req, res, user);
      };

      passport.authenticate('localapikey', caller)(req, res, next);
    });
  },

  delete: function(app, path, callback) {
    app.delete(path, function(req, res, next) {
      if (!req.query.token) {
        const err = errors.errorAuthenticationFailure('Missing credentials');
        return res.status(err.status).send(err);
      }

      const caller = function(autherr, user, info) {
        if (!user) {
          const err = errors.errorAuthenticationFailure(autherr ||
                                                        info.message ||
                                                        'Unknown error');
          return res.status(err.status).send(err);
        }
        callback(req, res, user);
      };

      passport.authenticate('localapikey', caller)(req, res, next);
    });
  },
};
