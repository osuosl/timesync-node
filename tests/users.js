'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without affecting other tests
  return JSON.parse(JSON.stringify(obj));
}

let user = 'tschuy';
let password = 'password';

module.exports = function(expect, request, baseUrl) {
  function getAPIToken() {
    const requestOptions = {
      url: baseUrl + 'login',
      json: true,
    };
    requestOptions.body = {
      auth: {
        type: 'password',
        username: user,
        password: password,
      },
    };
    return new Promise(function(resolve) {
      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        resolve(body.token);
      });
    });
  }

  describe('GET /users', function() {
    it('returns all active users in the database', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });
  });

  describe('GET /users?include_deleted=true', function() {
    it('returns all active and deleted users in the database', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('ignores extra params if user specifies invalid params', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });
  });

  describe('GET /users/:usernames', function() {
    it('returns a single user by username', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('returns an error if ?include_deleted is passed', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails with an Object Not Found error', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails with an Invalid Identifier error', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });
  });

  describe('POST /users', function() {
    it('successfully creates a new user with all fields', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('successfully creates a new user with all possible nulls',
    function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with bad authentication', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with bad authorization', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with bad username', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with bad password', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with bad email', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid display_name type',
    function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid username type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid password type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid email type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid spectator type',
    function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid manager type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid admin type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid active type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with invalid meta type', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with explicit created_at', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with explicit updated_at', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with explicit deleted_at', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with no username', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails to create a new user with no password', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });
  });

  describe('POST /users/:username', function() {
    it("successfully updates a user's username, display name, password, " +
       'email, and meta', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's username", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's display name", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's password", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's email", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's meta", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's spectator status", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's manager status", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's admin status", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("successfully updates a user's active status", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with bad authentication", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with bad authorization", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with bad values", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with bad username", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with bad password", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with bad email", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid username type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid display name type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid password type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid email type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid spectator type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid manager type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid admin type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid active type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with invalid meta type", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with explicit created_at", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with explicit updated_at", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it("doesn't update a user with explicit deleted_at", function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });
  });

  describe('DELETE /users/:username', function() {
    it('successfully deletes a user', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails if it receives a nonexistent user', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });

    it('fails if it receives an invalid user', function(done) {
      getAPIToken().then(function(token) {
        done(token);
      });
    });
  });
};
