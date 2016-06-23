'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without affecting other tests
  return JSON.parse(JSON.stringify(obj));
}

const defaultUsername = 'admin1';
const defaultPassword = 'password';

module.exports = function(expect, request, baseUrl) {
  function getAPIToken(username, password) {
    const requestOptions = {
      url: baseUrl + 'login',
      json: true,
    };
    requestOptions.body = {
      auth: {
        type: 'password',
        username: username || defaultUsername,
        password: password || defaultPassword,
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

  const initialDataWithDeleted = [
    {
      display_name: 'Project Manager',
      username: 'pManager',
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
      display_name: 'Admin User',
      username: 'admin1',
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
      display_name: 'Site Manager',
      username: 'sManager',
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
      display_name: 'Site Spectator',
      username: 'sSpectator',
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
      display_name: 'Normal User',
      username: 'user1',
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
      display_name: 'Deleted Project Manager',
      username: 'delPManager',
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
      display_name: 'Deleted User',
      username: 'deleted',
      email: 'deleted@example.com',
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
  const initialData = initialDataWithDeleted.filter(u => {
    return u.deleted_at === null;
  });

  describe('GET /users', function() {
    it('returns all active users in the database', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}users?token=${token}`, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(JSON.parse(body)).to.deep.have.same.members(initialData);
          done();
        });
      });
    });
  });

  describe('GET /users?include_deleted=true', function() {
    it('returns all active and deleted users in the database', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}users?include_deleted=true&token=${token}`,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.have.same
                                              .members(initialDataWithDeleted);
          done();
        });
      });
    });

    it('ignores extra params if user specifies invalid params', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}users?include_deleted=true&f=b&token=${token}`,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.have.same
                                              .members(initialDataWithDeleted);
          done();
        });
      });
    });
  });

  describe('GET /users/:usernames', function() {
    it('returns a single user by username', function(done) {
      getAPIToken().then(function(token) {
        const user = 'admin1';
        request.get(`${baseUrl}users/${user}?token=${token}`,
        function(err, res, body) {
          const expectedResult = initialData.filter(u => {
            return u.username === user;
          })[0];

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          done();
        });
      });
    });

    it('returns a deleted user if ?include_deleted is passed', function(done) {
      getAPIToken().then(function(token) {
        const user = 'deleted';
        request.get(`${baseUrl}users/${user}?include_deleted=true&token=` +
        token, function(err, res, body) {
          const expectedResult = initialDataWithDeleted.filter(u => {
            return u.username === user;
          })[0];

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
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
        expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
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

          expectedResult.created_at = new Date(expectedResult.created_at)
                                          .toISOString()
                                          .substring(0, 10);

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

          expectedResult.created_at = new Date(expectedResult.created_at)
                                          .toISOString()
                                          .substring(0, 10);

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
            error: 'Authentication failure',
            text: 'Bad API token',
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(401);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new user with bad authorization', function(done) {
      getAPIToken('sSpectator', 'word').then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 401,
            error: 'Authorization failure',
            text: 'sSpectator is not authorized to create users',
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

    it('fails to create a new user with duplicate username', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(postNewUserMinimum);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.username = 'sManager';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);

          const expectedResult = {
            status: 409,
            error: 'Username already exists',
            text: 'username sManager already exists',
            values: ['sManager'],
          };

          expect(body).to.deep.equal(expectedResult);

          expect(res.statusCode).to.equal(409);

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
      username: 'deleted',
      display_name: 'Deleted User',
      email: 'deleted@example.com',
      site_spectator: false,
      site_manager: false,
      site_admin: false,
      active: false,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: '2016-02-17',
      meta: 'A sample deleted user',
    };

    const updatedAt = new Date().toISOString().substring(0, 10);
    const postUpdatedUser = {
      display_name: 'Undeleted User',
      email: 'undeleted@example.com',
      password: 'new_password',
      meta: 'An undeleted user',
    };

    const postUpdatedUserPermissions = {
      display_name: 'Undeleted User',
      email: 'undeleted@example.com',
      password: 'new_password',
      site_spectator: true,
      site_manager: true,
      site_admin: true,
      active: true,
      meta: 'An undeleted user',
    };

    const getUpdatedUser = {
      username: 'deleted',
      display_name: 'Undeleted User',
      email: 'undeleted@example.com',
      site_spectator: false,
      site_manager: false,
      site_admin: false,
      active: false,
      meta: 'An undeleted user',
      created_at: '2014-01-01',
      updated_at: updatedAt,
      deleted_at: null,
    };

    const getUpdatedUserPermissions = {
      username: 'deleted',
      display_name: 'Undeleted User',
      email: 'undeleted@example.com',
      site_spectator: true,
      site_manager: true,
      site_admin: true,
      active: true,
      meta: 'An undeleted user',
      created_at: '2014-01-01',
      updated_at: updatedAt,
      deleted_at: null,
    };

    const badUpdatedUser = { // Invalid values but correct types
      username: 'undeleted', // Username can't be changed
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
      url: baseUrl + 'users/deleted',
      json: true,
    };

    function checkPostToEndpoint(done, uri, postObj, expectedResults, error,
    statusCode, postBodies, username, password, callback) {
      getAPIToken(username, password).then(function(token) {
        const options = copyJsonObject(requestOptions);
        postArg.object = postObj;
        options.body = postArg;

        options.body.auth.token = token;
        if (uri) {
          options.uri = uri;
        }

        // make a given post request
        // check the error
        // check the statusCode
        // Also check the body of the request
        request.post(options, function(err, res, body) {
          expect(body.error).to.equal(error);
          expect(res.statusCode).to.equal(statusCode);

          if (postBodies !== undefined) {
            // Is the recieved body within the array of expected bodies
            expect(body).to.deep.equal(postBodies[0]);
          }

          // Always checks for valid get request
          // err is always 'null'
          // res.statusCode is always 200
          // body always equals expectedresults
          request.get(requestOptions.url + '?include_deleted=true&token=' +
          token, function(err0, res0, body0) {
            const jsonBody = JSON.parse(body0);
            expect(jsonBody.error).to.equal(undefined);
            expect(res0.statusCode).to.equal(200);
            expectedResults.updated_at = jsonBody.updated_at;
            expect(jsonBody).to.deep.equal(expectedResults);

            if (callback) {
              callback(done);
            } else {
              done();
            }
          });
        });
      });
    }

    it("successfully updates a user's display name, password, email, and meta" +
    ' by an admin', function(done) {
      const postObj = copyJsonObject(postUpdatedUser);
      const expectedResults = copyJsonObject(getUpdatedUser);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's display name, password, email, meta" +
    ' active state, and permissions by an admin', function(done) {
      const postObj = copyJsonObject(postUpdatedUserPermissions);
      const expectedResults = copyJsonObject(getUpdatedUserPermissions);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's display name", function(done) {
      const postObj = {display_name: postUpdatedUser.display_name};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.display_name = postObj.display_name;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's password", function(done) {
      const bcrypt = require('bcrypt');
      bcrypt.genSalt(10, function(genSaltErr, salt) {
        bcrypt.hash(postUpdatedUser.password, salt, function(hashErr, hash) {
          const postObj = {password: hash};
          const expectedResults = copyJsonObject(originalUser);
          expectedResults.deleted_at = null;
          expectedResults.updated_at = updatedAt;
          let error;
          const statusCode = 200;

          checkPostToEndpoint(done, null, postObj, expectedResults, error,
          statusCode, undefined, undefined, undefined, function(done0) {
            getAPIToken(originalUser.username, postUpdatedUser.password)
            .then(function(token) {
              expect(token).to.be.a('string');
              done0();
            });
          });
        });
      });
    });

    it("successfully updates a user's email", function(done) {
      const postObj = {email: postUpdatedUser.email};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.email = postObj.email;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's meta", function(done) {
      const postObj = {meta: postUpdatedUser.meta};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.meta = postObj.meta;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's site_spectator status", function(done) {
      const postObj = {site_spectator:
                                    postUpdatedUserPermissions.site_spectator};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.site_spectator = postObj.site_spectator;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's site_manager status", function(done) {
      const postObj = {site_manager: postUpdatedUserPermissions.site_manager};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.site_manager = postObj.site_manager;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's site_admin status", function(done) {
      const postObj = {site_admin: postUpdatedUserPermissions.site_admin};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.site_admin = postObj.site_admin;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully updates a user's active status", function(done) {
      const postObj = {active: postUpdatedUserPermissions.active};
      const expectedResults = copyJsonObject(originalUser);
      expectedResults.active = postObj.active;
      expectedResults.deleted_at = null;
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("doesn't update a non-existent user", function(done) {
      const uri = baseUrl + 'users/nonexistent';
      const postObj = {meta: postUpdatedUser.meta};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent user',
      };

      checkPostToEndpoint(done, uri, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with bad authorization", function(done) {
      const postObj = {meta: postUpdatedUser.meta};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 401,
        error: 'Authorization failure',
        text: 'sSpectator is not authorized to modify user deleted',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error], 'sSpectator', 'word');
    });

    it("doesn't update a user's username", function(done) {
      const postObj = {username: badUpdatedUser.username};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'user does not have a username field',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with bad email", function(done) {
      const postObj = {email: badUpdatedUser.email};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field email of user should be valid email but was sent as ' +
              'string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid display name type", function(done) {
      const postObj = {display_name: invalidUpdatedUser.display_name};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field display_name of user should be string but was sent as ' +
              'array',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid password type", function(done) {
      const postObj = {password: invalidUpdatedUser.password};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field password of user should be string but was sent as array',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid email type", function(done) {
      const postObj = {email: invalidUpdatedUser.email};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field email of user should be valid email but was sent as ' +
              'object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid site_spectator type",
    function(done) {
      const postObj = {site_spectator: invalidUpdatedUser.site_spectator};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field site_spectator of user should be boolean but was sent ' +
              'as string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid site_manager type", function(done) {
      const postObj = {site_manager: invalidUpdatedUser.site_manager};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field site_manager of user should be boolean but was sent ' +
              'as string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid site_admin type", function(done) {
      const postObj = {site_admin: invalidUpdatedUser.site_admin};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field site_admin of user should be boolean but was sent ' +
              'as string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid active type", function(done) {
      const postObj = {active: invalidUpdatedUser.active};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field active of user should be boolean but was sent as string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with invalid meta type", function(done) {
      const postObj = {meta: invalidUpdatedUser.meta};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field meta of user should be string but was sent as array',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with explicit created_at", function(done) {
      const postObj = {created_at: badUpdatedUser.created_at};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'user does not have a created_at field',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with explicit updated_at", function(done) {
      const postObj = {updated_at: badUpdatedUser.updated_at};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'user does not have a updated_at field',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't update a user with explicit deleted_at", function(done) {
      const postObj = {deleted_at: badUpdatedUser.deleted_at};
      const expectedResults = copyJsonObject(originalUser);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'user does not have a deleted_at field',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });
  });

  describe('DELETE /users/:username', function() {
    it('successfully deletes a user', function(done) {
      getAPIToken().then(function(token) {
        const user = 'delPManager';
        request.del(`${baseUrl}users/${user}?token=${token}`,
        function(err, res) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          request.get(`${baseUrl}users/${user}?token=${token}`,
          function(getErr, getRes, getBody) {
            const expectedError = {
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent user',
            };
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal(expectedError);
            expect(getRes.statusCode).to.equal(expectedError.status);

            request.get(`${baseUrl}users?token=${token}`,
            function(getAllErr, getAllRes, getAllBody) {
              const expectedResults = initialData.filter(u => {
                return u.username !== user;
              });
              expect(getAllErr).to.equal(null);
              expect(JSON.parse(getAllBody)).to.deep.have.same
                                                    .members(expectedResults);
              expect(getAllRes.statusCode).to.equal(200);
              done();
            });
          });
        });
      });
    });

    it('fails if it receives a nonexistent user', function(done) {
      getAPIToken().then(function(token) {
        request.del(`${baseUrl}users/notauser?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent user',
          };
          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}users?token=${token}`,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            expect(getRes.statusCode).to.equal(200);
            done();
          });
        });
      });
    });

    it('fails if it receives an invalid user', function(done) {
      getAPIToken().then(function(token) {
        const user = '!nv4l|d';
        request.del(`${baseUrl}users/${user}?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: `Expected username but received ${user}`,
            values: [user],
          };
          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}users?token=${token}`,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            expect(getRes.statusCode).to.equal(200);
            done();
          });
        });
      });
    });
  });
};
