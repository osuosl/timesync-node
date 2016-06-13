'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without effecting other tests
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

  const initialDataWithDeleted = [
    {
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      name: 'Ganeti Web Manager',
      slugs: ['ganeti-webmgr', 'gwm'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      revision: 1,
      users: {
        tschuy: {member: true, spectator: true, manager: true},
        mrsj: {member: true, spectator: true, manager: false},
        MaraJade: {member: true, spectator: true, manager: true},
        deanj: {member: true, spectator: true, manager: false},
      },
    },
    {
      uri: 'https://code.osuosl.org/projects/pgd',
      name: 'Protein Geometry Database',
      slugs: ['pgd'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
      revision: 1,
      users: {
        deanj: {member: true, spectator: true, manager: true},
        patcht: {member: true, spectator: true, manager: false},
      },
    },
    {
      uri: 'https://github.com/osu-cass/whats-fresh-api',
      name: 'Whats Fresh',
      slugs: ['wf'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
      revision: 1,
      users: {
        deanj: {member: true, spectator: false, manager: false},
        tschuy: {member: true, spectator: true, manager: true},
        thai: {member: true, spectator: false, manager: false},
      },
    },
    {
      uri: 'https://github.com/osuosl/timesync',
      name: 'Timesync',
      slugs: ['timesync', 'ts'],
      default_activity: 'dev',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
      revision: 1,
      users: {
        patcht: {member: true, spectator: true, manager: true},
      },
    },
    {
      uri: 'https://github.com/osuosl/chiliproject',
      name: 'Chili Project',
      slugs: [],
      default_activity: null,
      deleted_at: '2014-01-01',
      updated_at: null,
      created_at: '2009-07-07',
      uuid: '6abe7f9a-2c4b-4c1d-b4f9-1222b47b8a29',
      revision: 1,
      users: {
        MaraJade: {member: true, spectator: true, manager: true},
      },
    },
  ];

  const initialData = initialDataWithDeleted.filter(function(datum) {
    return datum.deleted_at === null;
  });

/* GET one of the /projects endpoints and check its response against
  what should be returned */
  describe('GET /projects', function() {
    it('should return all projects in the database', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          jsonBody.forEach(function(result) {
            result.slugs.sort();
          });

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });
  });

  describe('GET /projects?include_deleted=:bool', function() {
    it('returns a list of all active and deleted projects', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects?include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(jsonBody).to.deep.equal(initialDataWithDeleted);
          done();
        });
      });
    });

    /* Tests that a nonexistent query parameter is ignored
     *
     * Users cannot query for a project by its slug in a querystring parameter.
     * But querying for deleted projects is similar to querying for times, so
     * the mistake may be relatively easy to make. Hence, the following. */
    it('ignores extra param if user specifies query with a projectslug',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects?project=chili&include_deleted=true&' +
        'token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(jsonBody).to.deep.equal(initialDataWithDeleted);
          done();
        });
      });
    });

    // Soft-deleted projects don't have any associated slugs, which makes the
    // following query invalid
    it('returns an error if user specifies with /projects/:slug endpoint',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/chili?include_deleted=true&' +
        'token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent project',
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);
          done();
        });
      });
    });
  });

  describe('GET /projects?user=:username', function() {
    it('returns all times for a user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects?user=tschuy&token=' + token,
        function(err, res, body) {
          expect(err).to.equal(null);

          const jsonBody = JSON.parse(body);
          const expectedResult = initialData.filter(function(project) {
            return project.users.tschuy;
          });

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    it('returns an error for a nonexistent user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects?user=notauser&token=' + token,
        function(err, res, body) {
          expect(err).to.equal(null);

          const jsonBody = JSON.parse(body);
          const expectedResult = {
            error: 'Bad query value',
            text: 'Parameter user contained invalid value notauser',
            status: 400,
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);
          done();
        });
      });
    });
  });

  describe('GET /projects/:slug', function() {
    it('should return projects by slug', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/gwm?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(jsonBody).to.deep.equal(initialData[0]);
          done();
        });
      });
    });

    it('should fail with Object Not Found error', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/404?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent project',
          };

          expect(jsonBody).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);

          done();
        });
      });
    });

    it('should fail with Invalid Slug error', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/test-!*@?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: 'Expected slug but received test-!*@',
            values: ['test-!*@'],
          };

          expect(jsonBody).to.eql(expectedResult);
          expect(res.statusCode).to.equal(400);

          done();
        });
      });
    });
  });

  // Tests Patching Projects
  describe('POST /projects/:slug', function() {
    const patchedProject = {
      name: 'Ganeti Web Mgr',
      slugs: ['gan-web', 'gwm'],
      uri: 'https://code.osuosl.org/projects/',
      default_activity: 'docs',
    };

    const originalProject = {
      name: 'Ganeti Web Manager',
      slugs: ['ganeti-webmgr', 'gwm'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      revision: 1,
      users: {
        tschuy: {member: true, spectator: true, manager: true},
        mrsj: {member: true, spectator: true, manager: false},
        MaraJade: {member: true, spectator: true, manager: true},
        deanj: {member: true, spectator: true, manager: false},
      },
    };

    const patchedProjectName = {name: patchedProject.name};
    const patchedProjectUri = {uri: patchedProject.uri};
    const patchedProjectSlugs = {slugs: patchedProject.slugs};
    const patchedProjectActivity =
            {default_activity: patchedProject.default_activity};
    const patchedProjectNewMember = {users: {
      tschuy: {member: true, spectator: true, manager: true},
      mrsj: {member: true, spectator: true, manager: false},
      MaraJade: {member: true, spectator: true, manager: true},
      deanj: {member: true, spectator: true, manager: false},
      thai: {member: true, spectator: false, manager: false}, // Add thai
    }};
    const patchedProjectBadMember = {users: {
      tschuy: {member: true, spectator: true, manager: true},
      mrsj: {member: true, spectator: true, manager: false},
      MaraJade: {member: true, spectator: true, manager: true},
      deanj: {member: true, spectator: true, manager: false},
      wasd: {member: true, spectator: false, manager: false}, // no wasd
    }};
    const patchedProjectPromotion = {users: {
      tschuy: {member: true, spectator: true, manager: true},
      mrsj: {member: true, spectator: true, manager: true}, // mrsj now manager
      MaraJade: {member: true, spectator: true, manager: true},
      deanj: {member: true, spectator: true, manager: false},
    }};
    const patchedProjectDemotion = {users: {
      tschuy: {member: true, spectator: true, manager: true},
      // mrsj no longer spectator
      mrsj: {member: true, spectator: false, manager: false},
      MaraJade: {member: true, spectator: true, manager: true},
      deanj: {member: true, spectator: true, manager: false},
    }};
    const patchedProjectSelfRemoval = {users: {
      mrsj: {member: true, spectator: true, manager: false},
      MaraJade: {member: true, spectator: true, manager: true},
      deanj: {member: true, spectator: true, manager: false},
    }};

    const badProject = {
      name: ['a name'],
      uri: ['a website'],
      slugs: 'a slug',
      default_activity: [100],
      key: 'value',
    };

    const badProjectName = {name: badProject.name};
    const badProjectUri = {uri: badProject.uri};
    const badProjectSlugs = {slugs: badProject.slugs};
    const badProjectActivity = {default_activity: badProject.default_activity};
    const badProjectKey = {key: 'value' };

    const postArg = {
      auth: {
        type: 'token',
      },
    };

    const requestOptions = {
      url: baseUrl + 'projects/gwm',
      json: true,
    };

    // Function used for validating that the object in the database
    // is in the correct state (change or unchanged based on if the POST
    // was valid)
    const checkListEndpoint = function(done, expectedResults, token) {
      // Make a get request
      request.get(requestOptions.url + '?token=' + token,
      function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const jsonBody = JSON.parse(body);
        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    };

    it("successfully patches a project's uri, slugs, name, and default " +
    'activity by an admin',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProject);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          // Set expected results to the new state of the project gwm
          const expectedResults = copyJsonObject(originalProject);
          expectedResults.name = patchedProject.name;
          expectedResults.uri = patchedProject.uri;
          expectedResults.slugs = patchedProject.slugs;
          expectedResults.default_activity = patchedProject.default_activity;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("successfully patches a project's uri, slugs, name, and " +
    'default_activity by a sitewide manager', function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'patcht';
      password = 'drowssap';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProject);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          // Set expected results to the new state of the project gwm
          const expectedResults = copyJsonObject(originalProject);
          expectedResults.name = patchedProject.name;
          expectedResults.uri = patchedProject.uri;
          expectedResults.slugs = patchedProject.slugs;
          expectedResults.default_activity = patchedProject.default_activity;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("successfully patches a project's uri, slugs, name, and " +
    'default_activity by its manager',
    function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'MaraJade';
      password = 'wording';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProject);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          // Set expected results to the new state of the project gwm
          const expectedResults = copyJsonObject(originalProject);
          expectedResults.name = patchedProject.name;
          expectedResults.uri = patchedProject.uri;
          expectedResults.slugs = patchedProject.slugs;
          expectedResults.default_activity = patchedProject.default_activity;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("successfully patches a project's uri", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectUri);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.uri = patchedProject.uri;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("successfully patches a project's slugs", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectSlugs);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.slugs = patchedProject.slugs;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("successfully patches a project's name", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectName);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.name = patchedProject.name;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it('successfully adds a new member', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectNewMember);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);
          expectedResults.users.thai = {member: true, spectator: false,
                                                                manager: false};

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it('successfully ignores nonexistent members', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectBadMember);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it('successfully promotes an existing user', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectPromotion);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);
          expectedResults.users.mrsj = {member: true, spectator: true,
                                                                manager: true};

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it('successfully demotes an existing user', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectDemotion);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);
          expectedResults.users.mrsj = {member: true, spectator: false,
                                                                manager: false};

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it('successfully removes the calling user', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectSelfRemoval);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);
          delete expectedResults.users.tschuy;

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("successfully patches a project's default activity", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProjectActivity);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const expectedResults = copyJsonObject(originalProject);
          expectedResults.default_activity = patchedProject.default_activity;
          expectedResults.uuid = originalProject.uuid;
          expectedResults.revision = 2;
          expectedResults.updated_at = new Date().toISOString()
                                                 .substring(0, 10);

          const expectedPost = copyJsonObject(expectedResults);
          delete expectedPost.deleted_at;
          delete expectedPost.users;

          // expect body of post request to be the new state of gwm
          expect(body).to.deep.equal(expectedPost);

          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a non-existent project", function(done) {
      getAPIToken().then(function(token) {
        const options = copyJsonObject(requestOptions);
        options.body = copyJsonObject(postArg);
        options.body.object = copyJsonObject(patchedProject);
        options.uri = baseUrl + 'projects/not-a-project';

        options.body.auth.token = token;

        request.post(options, function(err, res, body) {
          expect(err).to.equal(null);
          expect(body).to.deep.equal({
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent project',
          });
          expect(res.statusCode).to.equal(404);

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with bad authentication", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProject);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          expect(res.statusCode).to.equal(401);

          expect(body.error).to.equal('Authentication failure');
          expect(body.text).to.equal('Bad API token');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with invalid permissions", function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProject);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(res.statusCode).to.equal(401);

          expect(body.error).to.equal('Authorization failure');
          expect(body.text).to.equal('mrsj is not authorized to make changes ' +
          'to ' + originalProject.name);

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with bad uri, name, slugs, and default " +
    'activity',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(badProject);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);

          expect([
            'Field uri of project should be string but was sent as ' +
            'array',
            'Field name of project should be string but was sent as ' +
            'array',
            'Field slugs of project should be array but was sent as ' +
            'string',
            'Field default_activity of project should be string but was sent' +
            ' as number',
            'project does not have a key field',
          ]).to.include.members([body.text]);

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with only bad uri", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = badProjectUri;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field uri of project' +
          ' should be string but was sent as array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with only bad slugs", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(badProjectSlugs);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field slugs of' +
          ' project should be array but was sent as string');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with only bad name", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(badProjectName);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field name of' +
          ' project should be string but was sent as array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with just bad default activity",
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(badProjectActivity);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field default_activity of project ' +
          'should be string but was sent as array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with just invalid key", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(badProjectKey);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('project does not' +
          ' have a key field');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with wrong-type uri", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.uri = badProject.uri;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field uri of project' +
          ' should be string but was sent as array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with invalid uri", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.uri = 'string but not uri';

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field uri of project' +
          ' should be uri but was sent as string');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with invalid slugs", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.slugs = ['@#SAfsda', '232sa$%'];

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field slugs of project' +
          ' should be slugs but was sent as non-slug strings');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with wrong-type slugs", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.slugs = badProject.slugs;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field slugs of' +
          ' project should be array but was sent as string');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with missing slugs", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.slugs = [];

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field slugs of project should be array ' +
          'of slugs but was sent as empty array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with existent slugs", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(patchedProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.slugs = ['gwm', 'pgd'];

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('The slug provided already exists');
          expect(res.statusCode).to.equal(409);
          expect(body.text).to.equal('slug pgd already exists');
          expect(body.values).to.deep.equal(['pgd']);

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with wrong-type name", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.name = badProject.name;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field name of' +
          ' project should be string but was sent as array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with existing name", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.name = 'Protein Geometry Database';

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field name of project should be unique ' +
          'name but was sent as name which already exists');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with non-existent default activity",
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.default_activity = 'not_an_activity';

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Invalid foreign key');
          expect(res.statusCode).to.equal(409);
          expect(body.text).to.equal('The project does not contain a valid ' +
          'activity reference.');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with wrong-type default activity",
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.default_activity =
                                                    badProject.default_activity;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field default_activity of' +
          ' project should be string but was sent as array');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });

    it("doesn't patch a project with invalid key", function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(originalProject);
        delete requestOptions.body.object.uuid;
        delete requestOptions.body.object.revision;
        delete requestOptions.body.object.deleted_at;
        delete requestOptions.body.object.updated_at;
        delete requestOptions.body.object.created_at;
        requestOptions.body.object.key = badProject.key;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('project does not' +
          ' have a key field');

          const expectedResults = copyJsonObject(originalProject);
          checkListEndpoint(done, expectedResults, token);
        });
      });
    });
  });

  describe('POST /projects', function() {
    // the project object to attempt to add
    const project = {
      uri: 'https://github.com/osuosl/timesync-node',
      slugs: ['timesync-node', 'tsn'],
      name: 'TimeSync Node',
      default_activity: 'meeting',
      users: {
        patcht: {member: true, spectator: true, manager: true},
        thai: {member: true, spectator: true, manager: false},
      },
    };

    // the project as added to the database
    const newProject = {
      uri: 'https://github.com/osuosl/timesync-node',
      slugs: ['timesync-node', 'tsn'],
      name: 'TimeSync Node',
      default_activity: 'meeting',
      revision: 1,
      created_at: new Date().toISOString().substring(0, 10),
      users: {
        patcht: {member: true, spectator: true, manager: true},
        thai: {member: true, spectator: true, manager: false},
      },
    };

    // the base POST JSON
    const postArg = {
      auth: {
        type: 'token',
      },
      object: project,
    };

    const requestOptions = {
      url: baseUrl + 'projects/',
      json: true,
      method: 'POST',
    };

    function checkListEndpoint(done, expectedGetResults, token) {
      request.get(baseUrl + 'projects?token=' + token,
      function(getErr, getRes, getBody) {
        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);

        const jsonGetBody = JSON.parse(getBody);
        // the projects/ list shouldn't have changed
        expect(jsonGetBody).to.deep.have.same.members(expectedGetResults);
        done();
      });
    }

    it('successfully creates a new project with slugs by an admin',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = postArg;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedGetResults = initialData.concat([
            {
              uri: 'https://github.com/osuosl/timesync-node',
              slugs: ['timesync-node', 'tsn'],
              name: 'TimeSync Node',
              default_activity: 'meeting',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
              users: {
                patcht: {member: true, spectator: true, manager: true},
                thai: {member: true, spectator: true, manager: false},
              },
            },
          ]);

          checkListEndpoint(done, expectedGetResults, token);
        });
      });
    });

    it('successfully creates a new project with slugs by a sitewide manager',
    function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'patcht';
      password = 'drowssap';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = postArg;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedGetResults = initialData.concat([
            {
              uri: 'https://github.com/osuosl/timesync-node',
              slugs: ['timesync-node', 'tsn'],
              name: 'TimeSync Node',
              default_activity: 'meeting',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
              users: {
                patcht: {member: true, spectator: true, manager: true},
                thai: {member: true, spectator: true, manager: false},
              },
            },
          ]);

          checkListEndpoint(done, expectedGetResults, token);
        });
      });
    });

    it('successfully creates a new project with no uri', function(done) {
      getAPIToken().then(function(token) {
        // remove uri from post data
        const postNoUri = copyJsonObject(postArg);
        postNoUri.object.uri = undefined;
        requestOptions.body = postNoUri;

        requestOptions.body.auth.token = token;

        // remove uri from test object
        const newProjectNoUri = copyJsonObject(newProject);
        delete newProjectNoUri.uri;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProjectNoUri);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedGetResults = initialData.concat([
            {
              uri: null,
              slugs: ['timesync-node', 'tsn'],
              name: 'TimeSync Node',
              default_activity: 'meeting',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
              users: {
                patcht: {member: true, spectator: true, manager: true},
                thai: {member: true, spectator: true, manager: false},
              },
            },
          ]);

          checkListEndpoint(done, expectedGetResults, token);
        });
      });
    });

    it('successfully creates a new project with no users', function(done) {
      getAPIToken().then(function(token) {
        // remove uri from post data
        const postNoUsers = copyJsonObject(postArg);
        delete postNoUsers.object.users;
        requestOptions.body = postNoUsers;

        requestOptions.body.auth.token = token;

        // remove uri from test object
        const newProjectNoUsers = copyJsonObject(newProject);
        delete newProjectNoUsers.users;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProjectNoUsers);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedGetResults = initialData.concat([
            {
              uri: 'https://github.com/osuosl/timesync-node',
              slugs: ['timesync-node', 'tsn'],
              name: 'TimeSync Node',
              default_activity: 'meeting',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
            },
          ]);

          checkListEndpoint(done, expectedGetResults, token);
        });
      });
    });

    it('successfully creates a new project with a bad user', function(done) {
      getAPIToken().then(function(token) {
        // remove uri from post data
        const postBadUser = copyJsonObject(postArg);
        postBadUser.object.users.wasd =
                              {member: true, spectator: false, manager: false};
        requestOptions.body = postBadUser;

        requestOptions.body.auth.token = token;

        const newProjectBadUser = copyJsonObject(newProject);

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProjectBadUser);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedGetResults = initialData.concat([
            {
              uri: 'https://github.com/osuosl/timesync-node',
              slugs: ['timesync-node', 'tsn'],
              name: 'TimeSync Node',
              default_activity: 'meeting',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
              users: {
                patcht: {member: true, spectator: true, manager: true},
                thai: {member: true, spectator: true, manager: false},
              },
            },
          ]);

          checkListEndpoint(done, expectedGetResults, token);
        });
      });
    });

    it('successfully creates a new project with no default activity',
    function(done) {
      getAPIToken().then(function(token) {
        // remove uri from post data
        const postNoActivity = copyJsonObject(postArg);
        postNoActivity.object.default_activity = undefined;
        requestOptions.body = postNoActivity;

        requestOptions.body.auth.token = token;

        // remove uri from test object
        const newProjectNoActivity = copyJsonObject(newProject);
        delete newProjectNoActivity.default_activity;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProjectNoActivity);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          request.get(baseUrl + 'projects?token=' + token,
          function(getErr, getRes, getBody) {
            // the projects/ endpoint should now have one more project
            const expectedGetResults = initialData.concat([
              {
                uri: 'https://github.com/osuosl/timesync-node',
                slugs: ['timesync-node', 'tsn'],
                name: 'TimeSync Node',
                default_activity: null,
                deleted_at: null,
                updated_at: null,
                created_at: new Date().toISOString().substring(0, 10),
                revision: 1,
                uuid: addedProject.uuid,
                users: {
                  patcht: {member: true, spectator: true, manager: true},
                  thai: {member: true, spectator: true, manager: false},
                },
              },
            ]);

            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);

            const jsonBody = JSON.parse(getBody);
            expect(jsonBody).to.deep.have.same.members(expectedGetResults);
            done();
          });
        });
      });
    });

    it('fails to create a new project with bad authentication', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(newProject);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          expect(res.statusCode).to.equal(401);

          expect(body.error).to.equal('Authentication failure');
          expect(body.text).to.equal('Bad API token');

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with bad permissions', function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object = copyJsonObject(newProject);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(res.statusCode).to.equal(401);

          expect(body.error).to.equal('Authorization failure');
          expect(body.text).to.equal('mrsj is not authorized to create ' +
              'projects');

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an invalid uri', function(done) {
      getAPIToken().then(function(token) {
        const postInvalidUri = copyJsonObject(postArg);
        postInvalidUri.object.uri = "Ceci n'est pas un url";
        requestOptions.body = postInvalidUri;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'Bad object',
            text: 'Field uri of project should be uri but was sent as ' +
            'non-uri string',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an invalid slug', function(done) {
      getAPIToken().then(function(token) {
        const postInvalidSlug = copyJsonObject(postArg);
        // of these slugs, only 'dog' is valid
        postInvalidSlug.object.slugs = ['$*#*cat', 'dog', ')_!@#mouse'];
        requestOptions.body = postInvalidSlug;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'Bad object',
            text: 'Field slugs of project should be slugs but was sent as ' +
            'non-slug strings',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an existing slug', function(done) {
      getAPIToken().then(function(token) {
        const postExistingSlug = copyJsonObject(postArg);
        postExistingSlug.object.slugs = ['dog', 'ganeti-webmgr', 'gwm'];
        requestOptions.body = postExistingSlug;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 409,
            error: 'The slug provided already exists',
            text: 'slugs gwm, ganeti-webmgr already exist',
            values: ['ganeti-webmgr', 'gwm'],
          };

          body.values.sort();
          expectedError.values.sort();

          if (body.text.substring(0, 10) === 'slugs gane') {
            expectedError.text = 'slugs ganeti-webmgr, gwm already exist';
          }

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(409);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with no slugs', function(done) {
      getAPIToken().then(function(token) {
        const postNoSlug = copyJsonObject(postArg);
        postNoSlug.object.slugs = undefined;
        requestOptions.body = postNoSlug;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'Bad object',
            text: 'The project is missing a slugs',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with no name', function(done) {
      getAPIToken().then(function(token) {
        const postNoName = copyJsonObject(postArg);
        postNoName.object.name = undefined;
        requestOptions.body = postNoName;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'Bad object',
            text: 'The project is missing a name',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an existing name', function(done) {
      getAPIToken().then(function(token) {
        const postExistingName = copyJsonObject(postArg);
        postExistingName.object.name = 'Protein Geometry Database';
        requestOptions.body = postExistingName;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'Bad object',
            text: 'Field name of project should be unique name but was sent ' +
            'as name which already exists',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a project with bad slugs datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object.slugs = 'test';

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field slugs of' +
          ' project should be array but was sent as string');

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a project with bad name datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object.name = ['test'];

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field name of' +
          ' project should be string but was sent as array');

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with non-existent default activity',
    function(done) {
      getAPIToken().then(function(token) {
        const postBadActivity = copyJsonObject(postArg);
        postBadActivity.object.default_activity = 'not_an_activity';
        requestOptions.body = postBadActivity;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 409,
            error: 'Invalid foreign key',
            text: 'The project does not contain a valid activity reference.',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(409);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with bad default activity datatype',
    function(done) {
      getAPIToken().then(function(token) {
        const postBadActivity = copyJsonObject(postArg);
        postBadActivity.object.default_activity = [105];
        requestOptions.body = postBadActivity;

        request.post(requestOptions, function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'Bad object',
            text: 'Field default_activity of project should be string but ' +
                  'was sent as array',
          };

          expect(body).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a project with bad uri datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);
        requestOptions.body.object.uri = ['test'];

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(body.error).to.equal('Bad object');
          expect(res.statusCode).to.equal(400);
          expect(body.text).to.equal('Field uri of' +
          ' project should be string but was sent as array');

          checkListEndpoint(done, initialData, token);
        });
      });
    });
  });

  describe('DELETE /projects/:slug', function() {
    it('deletes the desired project if no times are associated with it',
    function(done) {
      getAPIToken().then(function(token) {
        request.del(baseUrl + 'projects/ts?token=' + token, function(err, res) {
          expect(res.statusCode).to.equal(200);
          request.get(baseUrl + 'projects/ts?token=' + token,
          function(getErr, getRes, getBody) {
            const jsonBody = JSON.parse(getBody);
            const expectedResult = {
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent project',
            };

            expect(jsonBody).to.deep.equal(expectedResult);
            expect(getRes.statusCode).to.equal(404);
            done();
          });
        });
      });
    });

    it('Fails if it recieves a project with times associated', function(done) {
      getAPIToken().then(function(token) {
        request.del(baseUrl + 'projects/pgd?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 405,
            error: 'Method not allowed',
            text: 'The method specified is not allowed for ' +
            'the project identified',
          };

          expect(res.statusCode).to.equal(405);
          expect(jsonBody).to.deep.equal(expectedResult);

          request.get(baseUrl + 'projects?token=' + token,
          function(getErr, getRes, getBody) {
            const jsonGetBody = JSON.parse(getBody);
            const expectedGetResult = initialData.filter(function(project) {
              return project.deleted_at === null;
            });

            expect(getRes.statusCode).to.equal(200);
            expect(jsonGetBody).to.deep.have.same.members(expectedGetResult);

            done();
          });
        });
      });
    });

    it('Fails if it receives an invalid project', function(done) {
      getAPIToken().then(function(token) {
        request.del(baseUrl + 'projects/Not.a!project?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: 'Expected slug but received Not.a!project',
            values: ['Not.a!project'],
          };

          expect(res.statusCode).to.equal(400);
          expect(jsonBody).to.deep.equal(expectedResult);

          request.get(baseUrl + 'projects?token=' + token,
          function(getErr, getRes, getBody) {
            const jsonGetBody = JSON.parse(getBody);

            expect(getRes.statusCode).to.equal(200);
            expect(jsonGetBody).to.deep.have.same.members(initialData);

            done();
          });
        });
      });
    });

    it('Fails if it receives a non-existent project', function(done) {
      getAPIToken().then(function(token) {
        request.del(baseUrl + 'projects/doesntexist?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent slug',
          };

          expect(res.statusCode).to.equal(404);
          expect(jsonBody).to.deep.equal(expectedResult);

          request.get(baseUrl + 'projects?token=' + token,
          function(getErr, getRes, getBody) {
            const jsonGetBody = JSON.parse(getBody);

            expect(getRes.statusCode).to.equal(200);
            expect(jsonGetBody).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('Fails with bad permissions', function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        request.del(baseUrl + 'projects/ts?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 401,
            error: 'Authorization failure',
            text: 'mrsj is not authorized to delete project ts',
          };

          expect(res.statusCode).to.equal(401);
          expect(jsonBody).to.deep.equal(expectedResult);

          request.get(baseUrl + 'projects?token=' + token,
          function(getErr, getRes, getBody) {
            const jsonGetBody = JSON.parse(getBody);

            expect(getRes.statusCode).to.equal(200);
            expect(jsonGetBody).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });
  });

  describe('GET /projects/?include_revisions', function() {
    const currentTime = new Date().toISOString().substring(0, 10);

    const noParentsData = {
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      name: 'GANETI WEB MANAGER',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['ganeti-webmgr', 'gwm'],
      users: {
        tschuy: {member: true, spectator: true, manager: true},
        mrsj: {member: true, spectator: true, manager: false},
        MaraJade: {member: true, spectator: true, manager: true},
        deanj: {member: true, spectator: true, manager: false},
      },
    };

    const withParentsData = {
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      name: 'GANETI WEB MANAGER',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['ganeti-webmgr', 'gwm'],
      users: {
        tschuy: {member: true, spectator: true, manager: true},
        mrsj: {member: true, spectator: true, manager: false},
        MaraJade: {member: true, spectator: true, manager: true},
        deanj: {member: true, spectator: true, manager: false},
      },
      'parents': [
        {
          uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
          name: 'Ganeti Web Manager',
          uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
          default_activity: null,
          revision: 1,
          deleted_at: null,
          updated_at: null,
          created_at: '2014-01-01',
        },
      ],
    };

    beforeEach(function(done) {
      function getPostObject(uri, obj) {
        return {
          uri: uri,
          json: true,
          body: {
            auth: {
              type: 'token',
            },
            object: obj,
          },
        };
      }

      const project = 'gwm';
      const postProject = {
        name: 'GANETI WEB MANAGER',
      };
      const postArg = getPostObject(baseUrl + 'projects/' + project,
                      postProject);

      getAPIToken().then(function(token) {
        postArg.body.auth.token = token;
        request.post(postArg, function() {
          done();
        });
      });
    });

    // Tests that include_revisions=true includes revisions
    it('gets projects + revisions when include_revisions=true', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/?include_revisions=true&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(withParentsData);
          expect(JSON.parse(body)).to.not.include(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets projects + revisions when include_revisions is an empty parameter',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/?include_revisions&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(withParentsData);
          expect(JSON.parse(body)).to.not.include(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just projects when include_revisions=false', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/?include_revisions=false&token=' +
        token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just projects when include_revisions is not set', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(noParentsData);
          done();
        });
      });
    });
  });

  describe('GET /projects/:slug?include_revisions', function() {
    const currentTime = new Date().toISOString().substring(0, 10);
    const project = 'gwm';

    const noParentsData = {
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      name: 'GANETI WEB MANAGER',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['ganeti-webmgr', 'gwm'],
      users: {
        tschuy: {member: true, spectator: true, manager: true},
        mrsj: {member: true, spectator: true, manager: false},
        MaraJade: {member: true, spectator: true, manager: true},
        deanj: {member: true, spectator: true, manager: false},
      },
    };

    const withParentsData = {
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      name: 'GANETI WEB MANAGER',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['ganeti-webmgr', 'gwm'],
      users: {
        tschuy: {member: true, spectator: true, manager: true},
        mrsj: {member: true, spectator: true, manager: false},
        MaraJade: {member: true, spectator: true, manager: true},
        deanj: {member: true, spectator: true, manager: false},
      },
      'parents': [
        {
          uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
          name: 'Ganeti Web Manager',
          uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
          default_activity: null,
          revision: 1,
          deleted_at: null,
          updated_at: null,
          created_at: '2014-01-01',
        },
      ],
    };

    beforeEach(function(done) {
      function getPostObject(uri, obj) {
        return {
          uri: uri,
          json: true,
          body: {
            auth: {
              type: 'token',
            },
            object: obj,
          },
        };
      }

      const postProject = {
        name: 'GANETI WEB MANAGER',
      };
      const postArg = getPostObject(baseUrl + 'projects/' + project,
                      postProject);

      getAPIToken().then(function(token) {
        postArg.body.auth.token = token;
        request.post(postArg, function() {
          done();
        });
      });
    });

    // Tests that include_revisions=true includes revisions
    it('gets project + revisions when include_revisions=true',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/' + project + '?include_revisions=' +
          'true&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(withParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets project + revisions when include_revisions',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/' + project + '?include_revisions' +
          '&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(withParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just project when include_revisions=false', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/' + project + '?include_revisions=' +
          'false&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just project when include_revisions is not set', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'projects/' + project + '?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(noParentsData);
          done();
        });
      });
    });
  });
};
