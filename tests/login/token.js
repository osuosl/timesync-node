'use strict';

const chai = require('chai');
chai.use(require('chai-passport-strategy'));
const crypto = require('crypto');

module.exports = function(expect, request, baseUrl) {
  describe('Token-based login', function() {
    it('returns a token for a good user/pass', function(done) {
      const requestOptions = {
        url: baseUrl + 'login',
        json: true,
      };
      requestOptions.body = {
        auth: {
          type: 'password',
          username: 'sManager',
          password: 'drowssap',
        },
      };

      const now = Date.now();
      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const header = {
          typ: 'JWT',
          alg: 'HMAC-SHA512',
        };
        const payload = {
          iss: process.env.INSTANCE_NAME,
          sub: 'sManager',
          exp: now + (30 * 60 * 1000),
          iat: now,
        };
        let encoded = new Buffer(JSON.stringify(header)).toString('base64');
        encoded += '.' + new Buffer(JSON.stringify(payload)).toString('base64');

        const hmac = crypto.createHmac('SHA512', process.env.SECRET_KEY);
        hmac.setEncoding('base64');
        hmac.end(encoded, 'utf8', function() {
          const signature = hmac.read();

          const token = encoded + '.' + signature;

          expect(body).to.equal({'token': token});
        });
        done();
      });
    });

    it('returns invalid username/password message for bad username',
    function(done) {
      const requestOptions = {
        url: baseUrl + 'login',
        json: true,
      };
      requestOptions.body = {
        auth: {
          type: 'password',
          username: 'not_a_real_user',
          password: 'password',
        },
      };

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(401);

        expect(body).to.deep.equal({
          error: 'Authentication failure',
          text: 'Incorrect username or password',
          status: 401,
        });

        done();
      });
    });

    it('returns invalid username/password message for bad password',
    function(done) {
      const requestOptions = {
        url: baseUrl + 'login',
        json: true,
      };
      requestOptions.body = {
        auth: {
          type: 'password',
          username: 'sManager',
          password: 'not_a_real_password',
        },
      };

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(401);

        expect(body).to.deep.equal({
          error: 'Authentication failure',
          text: 'Incorrect username or password',
          status: 401,
        });

        done();
      });
    });

    it('returns missing creds message when no user/pass', function(done) {
      const requestOptions = {
        url: baseUrl + 'login',
        json: true,
      };
      requestOptions.body = {
        auth: {
          type: 'password',
        },
      };

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(401);

        expect(body).to.deep.equal({
          error: 'Authentication failure',
          text: 'Missing credentials',
          status: 401,
        });

        done();
      });
    });
  });
};
