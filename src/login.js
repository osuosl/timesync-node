'use strict';
const errors = require('./errors');
const passport = require('passport');
const crypto = require('crypto');

module.exports = function(app) {
  const log = app.get('log');
  const redis = app.get('redis');
  let authType;

  const MAX_AGE = process.env.MAX_TOKEN_AGE || 1800; // Default 30 minutes
  const MAX_AGE_MS = MAX_AGE * 1000;

  if (!process.env.INSTANCE_NAME || !process.env.SECRET_KEY) {
    log.error('login.js', 'INSTANCE_NAME or SECRET_KEY not set!');
    process.exit(1);
  }

  app.post(app.get('version') + '/login', function(req, res, next) {
    if (!req.body.auth) {
      return errors.send(errors.errorAuthenticationFailure(
        'Missing credentials'), res);
    }

    if (!req.body.auth.type) {
      return errors.send(errors.errorAuthenticationFailure(
        'Authentication type required'), res);
    }

    if (req.body.auth.type === 'password') {
      authType = 'local';
    } else if (req.body.auth.type === 'ldap') {
      authType = 'ldapauth';
    }

    if (app.get('strategies').indexOf(authType) < 0) {
      return errors.send(errors.errorAuthenticationTypeFailure(
        req.body.auth.type), res);
    }

    const caller = function(autherr, user, info) {
      if (!user) {
        return errors.send(errors.errorAuthenticationFailure(autherr ||
                                                            info.message ||
                                                            'Unknown error'),
                                                            res);
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
        exp: Date.now() + MAX_AGE_MS, // Expires after 30 minutes
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

        redis.set(token, Date.now(), 'nx', 'ex', MAX_AGE);

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

  return {
    authToken: function(unescapedToken) {
      return new Promise(function(resolve, reject) {
        const token = unescapedToken.replace(/\s/g, '+');

        if (!redis.exists(token)) {
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
            payload.exp < Date.now() || payload.iat + MAX_AGE_MS < Date.now()) {
              return reject({message: 'Bad API token'});
            }

            resolve(payload.sub);
          });
        } else {
          return reject({message: 'Unsupported token crypto-algorithm: ' +
                                                                  header.alg});
        }
      });
    },
  };
};
