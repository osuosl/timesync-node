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
        expect(err).to.equal(null);
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
      site_spectator: false,
      site_manager: false,
      site_admin: false,
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
      site_spectator: true,
      site_manager: true,
      site_admin: true,
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
      site_spectator: true,
      site_manager: true,
      site_admin: false,
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
      site_spectator: true,
      site_manager: false,
      site_admin: false,
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
      site_spectator: true,
      site_manager: false,
      site_admin: false,
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
      site_spectator: false,
      site_manager: false,
      site_admin: false,
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
      site_spectator: false,
      site_manager: false,
      site_admin: false,
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

          expect(jsonBody).to.deep.have.same.members(expectedResults);

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

    it('returns a deleted user if ?include_deleted is passed', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'users/' + initialData[6].username +
        '?include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);

          expect(jsonBody).to.deep.equal(initialData[6]);
          expect(res.statusCode).to.equal(200);
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
            status: 400,
            error: 'The provided identifier was invalid',
            text: 'Expected username but received !nv4l|d',
            values: ['!nv4l|d'],
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(400);
          done();
        });
      });
    });
  });

  describe('POST /users', function() {
    const postNewUserComplete = {
      username: 'guyn',
      display_name: 'New Guy',
      password: 'newguy1234',
      email: 'guyn@example.com',
      site_spectator: false,
      site_manager: false,
      site_admin: false,
      active: true,
      meta: 'Just arrived',
    };

    const getNewUserComplete = {
      username: 'guyn',
      display_name: 'New Guy',
      email: 'guyn@example.com',
      site_spectator: false,
      site_manager: false,
      site_admin: false,
      active: true,
      created_at: null, // Must be filled in by function because it varies
      updated_at: null,
      deleted_at: null,
      meta: 'Just arrived',
    };

    const postNewUserMinimum = {
      username: 'guyn',
      password: 'newguy1234',
    };

    const getNewUserMinimum = {
      username: 'guyn',
      display_name: null,
      email: null,
      site_spectator: false,
      site_manager: false,
      site_admin: false,
      active: true,
      created_at: null, // Must be filled in by function because it varies
      updated_at: null,
      deleted_at: null,
      meta: null,
    };

    const badNewUser = { // Invalid values but correct types
      username: '!nv4l|d',
      email: 'notanemail',
      created_at: '2016-02-17',
      updated_at: '2016-02-18',
      deleted_at: '2016-02-19',
    };

    const invalidNewUser = { // Wrong types
      username: [1223],
      display_name: [2334],
      password: [9876],
      email: {223: 322},
      site_spectator: 'yes',
      site_manager: 'no',
      site_admin: 'maybe',
      active: 'dunno',
      meta: [3.141592653],
    };

    const postArg = {
      auth: {
        type: 'token',
      },
    };

    const requestOptions = {
      url: baseUrl + 'users',
      json: true,
    };

    // Function used for validating that the object in the database
    // is in the correct state (change or unchanged based on if the POST
    // was valid)
    const checkListEndpoint = function(done, expectedResults, token) {
      // Make a get request
      request.get(requestOptions.url + '?token=' + token,
      function(err, res, body) {
        expect(err).to.equal(null);

        const jsonBody = JSON.parse(body);
        expect(jsonBody).to.deep.have.same.members(expectedResults);

        expect(res.statusCode).to.equal(200);
        done();
      });
    };

    it('successfully creates a new user with all fields', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserComplete);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(getNewUserComplete);
          expectedResult.created_at = body.created_at;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new user with all possible nulls',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(getNewUserMinimum);
          expectedResult.created_at = body.created_at;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('fails to create a new user with bad authentication', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 401,
            error: 'Authentication Failure',
            text: 'Incorrect username or password',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(401);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with bad authorization', function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 401,
            error: 'Authorization Failure',
            text: 'mrsj is not authorized to create users',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(401);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with bad username', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.username = badNewUser.username;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field username of user should be valid username but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with bad email', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.email = badNewUser.email;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field email of user should be valid email but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid display_name type',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.display_name = invalidNewUser.display_name;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field display_name of user should be string but was ' +
              'sent as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid username type', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.username = invalidNewUser.username;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field username of user should be string but was ' +
              'sent as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid password type', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.password = invalidNewUser.password;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field password of user should be string but was ' +
              'sent as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid email type', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.email = invalidNewUser.email;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field email of user should be string but was ' +
              'sent as object',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid site_spectator type',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.site_spectator =
                                                  invalidNewUser.site_spectator;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field site_spectator of user should be boolean but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid site_manager type',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.site_manager = invalidNewUser.site_manager;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field site_manager of user should be boolean but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid site_admin type',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.site_admin = invalidNewUser.site_admin;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field site_admin of user should be boolean but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid active type', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.active = invalidNewUser.active;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field active of user should be boolean but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with invalid meta type', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.meta = invalidNewUser.meta;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field meta of user should be string but was ' +
              'sent as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with explicit created_at', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.created_at = badNewUser.created_at;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a created_at field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with explicit updated_at', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.updated_at = badNewUser.updated_at;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a updated_at field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with explicit deleted_at', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.deleted_at = badNewUser.deleted_at;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a deleted_at field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with no username', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        delete requestOptions.body.object.username;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'The user is missing a username',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with no password', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        delete requestOptions.body.object.password;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'The user is missing a password',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });
  });

  describe('POST /users/:username', function() {
    const originalUser = {
      username: 'timero',
      display_name: 'Old Timer',
      email: 'timero@example.com',
      site_spectator: false,
      site_manager: false,
      site_admin: false,
      active: false,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: '2016-02-17',
      meta: 'A sample deleted user',
    };

    const updatedUser = {
      display_name: 'Old J. Timer',
      email: 'otimer@example.com',
      password: 'newpass',
      site_spectator: true,
      site_manager: true,
      site_admin: true,
      active: true,
      meta: 'An undeleted user',
    };

    const badUpdatedUser = { // Invalid values but correct types
      username: 'otimer', // Username can't be changed
      email: 'notanemail',
      created_at: '2016-02-17',
      updated_at: '2016-02-18',
      deleted_at: '2016-02-19',
    };

    const invalidUpdatedUser = { // Wrong types
      display_name: [2334],
      password: [9876],
      email: {223: 322},
      site_spectator: 'yes',
      site_manager: 'no',
      site_admin: 'maybe',
      active: 'dunno',
      meta: [3.141592653],
    };

    const postArg = {
      auth: {
        type: 'token',
      },
    };

    const requestOptions = {
      url: baseUrl + 'users/timero',
      json: true,
    };

    // Function used for validating that the object in the database
    // is in the correct state (change or unchanged based on if the POST
    // was valid)
    const checkListEndpoint = function(done, expectedResults, token) {
      // Make a get request
      request.get(requestOptions.url + '?token=' + token,
      function(err, res, body) {
        expect(err).to.equal(null);

        const jsonBody = JSON.parse(body);
        expect(jsonBody).to.deep.equal(expectedResults);

        expect(res.statusCode).to.equal(200);
        done();
      });
    };

    it("successfully updates a user's display name, password, email, and meta",
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          display_name: updatedUser.display_name,
          password: updatedUser.password,
          email: updatedUser.email,
          meta: updatedUser.meta,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.display_name = updatedUser.display_name;
          expectedResult.password = updatedUser.password;
          expectedResult.email = updatedUser.email;
          expectedResult.meta = updatedUser.meta;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's display name", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          display_name: updatedUser.display_name,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.display_name = updatedUser.display_name;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's password", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          password: updatedUser.password,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.password = updatedUser.password;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's email", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          email: updatedUser.email,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.email = updatedUser.email;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's meta", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          meta: updatedUser.meta,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.meta = updatedUser.meta;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's site_spectator status", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_spectator: updatedUser.site_spectator,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.site_spectator = updatedUser.site_spectator;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's site_manager status", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_manager: updatedUser.site_manager,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.site_manager = updatedUser.site_manager;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's site_admin status", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_admin: updatedUser.site_admin,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.site_admin = updatedUser.site_admin;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("successfully updates a user's active status", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_admin: updatedUser.site_admin,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = copyJsonObject(originalUser);
          expectedResult.active = updatedUser.active;
          expectedResult.updated_at = body.updated_at;
          expectedResult.deleted_at = null;

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(200);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with bad authentication", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(updatedUser);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 401,
            error: 'Authentication Failure',
            text: 'Invalid username or password',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(401);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with bad authorization", function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(updatedUser);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 401,
            error: 'Authorization Failure',
            text: 'mrsj is not authorized to modify user timero',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(401);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user's username", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          username: badUpdatedUser.username,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a username field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with bad email", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          email: badUpdatedUser.email,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field email of user should be valid email but was sent as ' +
              'string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid display name type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          display_name: invalidUpdatedUser.display_name,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field display_name of user should be string but was sent ' +
              'as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid password type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          password: invalidUpdatedUser.password,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field password of user should be string but was sent ' +
              'as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid email type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          email: invalidUpdatedUser.email,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field email of user should be string but was sent as object',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid site_spectator type",
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_spectator: invalidUpdatedUser.site_spectator,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field site_spectator of user should be boolean but was ' +
              'sent as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid site_manager type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_manager: invalidUpdatedUser.site_manager,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field site_manager of user should be boolean but was sent ' +
              'as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid site_admin type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          site_admin: invalidUpdatedUser.site_admin,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field site_admin of user should be boolean but was sent ' +
              'as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid active type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          active: invalidUpdatedUser.active,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field active of user should be boolean but was sent ' +
              'as string',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with invalid meta type", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          meta: invalidUpdatedUser.meta,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'Field meta of user should be string but was sent as array',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with explicit created_at", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          created_at: badUpdatedUser.created_at,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a created_at field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with explicit updated_at", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          updated_at: badUpdatedUser.updated_at,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a updated_at field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });

    it("doesn't update a user with explicit deleted_at", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = {
          deleted_at: badUpdatedUser.deleted_at,
        };

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 400,
            error: 'Bad object',
            text: 'user does not have a deleted_at field',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, expectedResult, token);
        });
      });
    });
  });

  describe('DELETE /users/:username', function() {
    it('successfully deletes a user', function(done) {
      getAPIToken().then(function(token) {
        request.delete(baseUrl + 'users/MaraJade?token=' + token,
        function(delErr, delRes, delBody) {
          expect(delErr).to.equal(null);
          expect(delBody).to.equal(null);
          expect(delRes.statusCode).to.equal(200);

          request.get(baseUrl + 'users/MaraJade?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal({
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent user',
            });
            expect(getRes.statusCode).to.equal(404);

            request.get(baseUrl + 'users?token=' + token,
            function(getAllErr, getAllRes, getAllBody) {
              expect(getAllErr).to.equal(null);
              expect(JSON.parse(getAllBody).to.deep.have.same.
                                            members(initialData.slice(0, -2)));
              expect(getAllRes.statusCode).to.equal(200);
              done();
            });
          });
        });
      });
    });

    it('fails if it receives a nonexistent user', function(done) {
      getAPIToken().then(function(token) {
        request.delete(baseUrl + 'users/notauser?token=' + token,
        function(delErr, delRes, delBody) {
          expect(delErr).to.equal(null);
          expect(JSON.parse(delBody)).to.deep.equal({
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent user',
          });
          expect(delRes.statusCode).to.equal(404);

          request.get(baseUrl + 'users?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody).to.deep.have.same.members(initialData));
            expect(getRes.statusCode).to.equal(200);
            done();
          });
        });
      });
    });

    it('fails if it receives an invalid user', function(done) {
      getAPIToken().then(function(token) {
        request.delete(baseUrl + 'users/!nv4l|d?token=' + token,
        function(delErr, delRes, delBody) {
          expect(delErr).to.equal(null);
          expect(JSON.parse(delBody)).to.deep.equal({
            status: 400,
            error: 'The provided identifier was invalid',
            text: 'Expected username but received !nv4l|d',
            identifiers: ['!nv4l|d'],
          });
          expect(delRes.statusCode).to.equal(404);

          request.get(baseUrl + 'users?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody).to.deep.have.same.members(initialData));
            expect(getRes.statusCode).to.equal(200);
            done();
          });
        });
      });
    });
  });
};
