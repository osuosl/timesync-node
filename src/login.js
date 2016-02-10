'use strict';
const errors = require('./errors');
const passport = require('passport');
const crypto = require('crypto');

const tokens = {};

const MAX_AGE = 30 * 60 * 1000;

module.exports = function(app) {
  const log = app.get('log');
  let authType;

  if (!process.env.INSTANCE_NAME || !process.env.SECRET_KEY) {
    log.error('login.js', 'INSTANCE_NAME or SECRET_KEY not set!');
    process.exit(1);
  }

  app.post(app.get('version') + '/login', function(req, res, next) {
    if (!req.body.auth) {
      const err = errors.errorAuthenticationFailure('Missing credentials');
      return res.status(err.status).send(err);
    }

    if (!req.body.auth.type) {
      const err = errors.errorAuthenticationFailure(
        'Authentication type required');
      return res.status(err.status).send(err);
    }

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

      /*
       * JWT tokens consist of three parts, each a Base-64 encoded JSON object.
       *
       * The header states the type and hashing algorithm.
       * The payload describes a variety of claims.
       * The signature is a hash of the first two and a secret.
       */
      const header = {
        typ: 'JWT',
        alg: 'HMAC-SHA512',
      };
      const payload = {
        iss: process.env.INSTANCE_NAME,
        sub: req.body.auth.username,
        exp: Date.now() + MAX_AGE, // Expires after 30 minutes
        iat: Date.now(),
      };
      let encoded = new Buffer(JSON.stringify(header)).toString('base64');
      encoded += '.' + new Buffer(JSON.stringify(payload)).toString('base64');

      const hmac = crypto.createHmac('SHA512',
                                            new Buffer(process.env.SECRET_KEY));
      hmac.setEncoding('base64');
      hmac.end(encoded, 'utf8', function() {
        const signature = hmac.read();

        const token = encoded + '.' + signature;

        tokens[token] = {created: Date.now()};

        res.set({
          'Cache-control': 'no-cache no-store must-validate max-age=0',
          'Expires': 'Thu, 01 Jan 1970 00:00:01 GMT',
          'Pragma': 'no-cache',
        });
        return res.send(JSON.stringify({'token': token}));
      });
    };

    passport.authenticate(authType, caller)(req, res, next);
  });

  const clearTokens = function() {
    if (tokens.length > 0) {
      /* eslint-disable prefer-const */
      for (let key in tokens) {
      /* eslint-enable prefer-const */
        if (tokens[key].created + MAX_AGE < Date.now()) {
          delete tokens[key];
        }
      }
    }
    setTimeout(clearTokens, 1000 * 60 * 60);
  };

  setTimeout(clearTokens, 1000 * 60 * 60);

  return {
    authToken: function(unescapedToken) {
      return new Promise(function(resolve, reject) {
        const token = unescapedToken.replace(/\s/g, '+');

        if (!tokens[token] || tokens[token].created + MAX_AGE < Date.now()) {
          return reject({message: 'Bad API token'});
        }

        const tokenParts = token.split('.');

        const header = JSON.parse(
          new Buffer(tokenParts[0], 'base64').toString()
        );

        if (header.alg === 'HMAC-SHA512') {
          const hmac = crypto.createHmac('SHA512', process.env.SECRET_KEY);
          hmac.setEncoding('base64');
          hmac.end(tokenParts[0] + '.' + tokenParts[1], 'utf8', function() {
            const signature = hmac.read();
            if (signature !== tokenParts[2]) {
              return reject({message: 'Bad API token'});
            }

            const payload = JSON.parse(
              new Buffer(tokenParts[1], 'base64').toString()
            );

            if (payload.iss !== process.env.INSTANCE_NAME ||
            payload.exp < Date.now() || payload.iat + MAX_AGE < Date.now()) {
              return reject({message: 'Bad API token'});
            }

            resolve(payload.sub);
          });
        } else {
          return reject({message: 'Unsupported algorithm'});
        }
      });
    },
  };
};
