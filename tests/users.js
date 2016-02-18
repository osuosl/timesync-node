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

  const initialData = [
    {
      display_name: 'Dean Johnson',
      username: 'deanj',
      email: null,
      spectator: false,
      manager: false,
      admin: false,
      active: false,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      meta: null,
    },
    {
      display_name: 'Evan Tschuy',
      username: 'tschuy',
      email: null,
      spectator: true,
      manager: true,
      admin: false,
      active: true,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      meta: null,
    },
    {
      display_name: 'Tristan Patch',
      username: 'patcht',
      email: null,
      spectator: true,
      manager: true,
      admin: true,
      active: true,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      meta: null,
    },
    {
      display_name: 'Matthew Johnson',
      username: 'mrsj',
      email: null,
      spectator: true,
      manager: false,
      admin: false,
      active: true,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      meta: null,
    },
    {
      display_name: 'Aileen Thai',
      username: 'thai',
      email: null,
      spectator: true,
      manager: false,
      admin: false,
      active: true,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      meta: null,
    },
    {
      display_name: 'Megan Goossens',
      username: 'MaraJade',
      email: null,
      spectator: false,
      manager: false,
      admin: false,
      active: true,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      meta: null,
    },
    {
      display_name: 'Old Timer',
      username: 'timero',
      email: 'timero@example.com',
      spectator: false,
      manager: false,
      admin: false,
      active: false,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: '2016-02-17',
      meta: 'A sample deleted user',
    },
  ];

  describe('GET /users', function() {
    it('returns all active users in the database', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users?token=' + token,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const jsonBody = JSON.parse(body);
          const expectedResults = initialData.filter(function(data) {
            return data.deleted_at === null;
          });

          expect(jsonBody).to.deep.equal(expectedResults);

          done();
        });
      });
    });
  });

  describe('GET /users?include_deleted=true', function() {
    it('returns all active and deleted users in the database', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users?include_deleted=true&token=' + token,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const jsonBody = JSON.parse(body);

          expect(jsonBody).to.deep.have.same.members(initialData);

          done();
        });
      });
    });

    it('ignores extra params if user specifies invalid params', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users?include_deleted=truefoo=bar&token=' +
        token,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const jsonBody = JSON.parse(body);

          expect(jsonBody).to.deep.have.same.members(initialData);

          done();
        });
      });
    });
  });

  describe('GET /users/:usernames', function() {
    it('returns a single user by username', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users/' + initialData[0].username +
        '?token=' + token,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const jsonBody = JSON.parse(body);

          expect(jsonBody).to.deep.equal(initialData[0]);

          done();
        });
      });
    });

    it('returns an error if ?include_deleted is passed', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users/' + initialData[6].username +
        'include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent user',
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);
          done();
        });
      });
    });

    it('fails with an Object Not Found error', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users/notauser?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent user',
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);
          done();
        });
      });
    });

    it('fails with an Invalid Identifier error', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users/!nv4l|d?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'The provided identifier was invalid',
            text: 'Expected username but received !nv4l|d',
            identifiers: ['!nv4l|d'],
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);
          done();
        });
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
