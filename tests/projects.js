'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without effecting other tests
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
      uri: 'http://example.com/project1',
      name: 'Project1',
      slugs: ['p1', 'project1'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      revision: 1,
      users: {
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
        Proj_Manager: {member: true, spectator: true, manager: false},
      },
    },
    {
      uri: 'http://example.com/project2',
      name: 'Project2',
      slugs: ['project2'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
      revision: 1,
      users: {
        Proj_Manager: {member: true, spectator: true, manager: true},
        Site_Manager: {member: true, spectator: true, manager: false},
      },
    },
    {
      uri: 'http://example.com/project3',
      name: 'Project3',
      slugs: ['project3'],
      default_activity: null,
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
      revision: 1,
      users: {
        Proj_Manager: {member: true, spectator: false, manager: false},
        admin1: {member: true, spectator: true, manager: true},
        user1: {member: true, spectator: false, manager: false},
      },
    },
    {
      uri: 'http://example.com/project-activity',
      name: 'Project With Activity',
      slugs: ['pa', 'project-activity'],
      default_activity: 'dev',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
      revision: 1,
      users: {
        Site_Manager: {member: true, spectator: true, manager: true},
      },
    },
    {
      uri: 'http://example.com/deleted-project',
      name: 'Deleted Project',
      slugs: [],
      default_activity: null,
      deleted_at: '2014-01-01',
      updated_at: null,
      created_at: '2009-07-07',
      uuid: '6abe7f9a-2c4b-4c1d-b4f9-1222b47b8a29',
      revision: 1,
      users: {
        delProj_Manager: {member: true, spectator: true, manager: true},
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
        request.get(`${baseUrl}projects?token=${token}`,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(JSON.parse(body)).to.deep.have.same.members(initialData);
          done();
        });
      });
    });
  });

  describe('GET /projects?include_deleted=:bool', function() {
    it('returns a list of all active and deleted projects', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}projects?include_deleted=true&token=${token}`,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(JSON.parse(body)).to.deep.have.same.
                                                members(initialDataWithDeleted);
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
        request.get(`${baseUrl}projects?project=chili&include_deleted=true&` +
        `token=${token}`, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          expect(JSON.parse(body)).to.deep.include.same.
                                                members(initialDataWithDeleted);
          done();
        });
      });
    });

    // Soft-deleted projects don't have any associated slugs, which makes the
    // following query invalid
    it('returns an error if user specifies with /projects/:slug endpoint',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}projects/chili?include_deleted=true&` +
        `token=${token}`, function(err, res, body) {
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent project',
          };

          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);
          done();
        });
      });
    });
  });

  describe('GET /projects?user=:username', function() {
    it('returns all projects for a user', function(done) {
      getAPIToken().then(function(token) {
        const username = 'admin1';
        request.get(`${baseUrl}projects?user=${username}&token=${token}`,
        function(err, res, body) {
          const expectedResult = initialData.filter(p => {
            return p.users[username];
          });

          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    it('returns an error for a nonexistent user', function(done) {
      getAPIToken().then(function(token) {
        const user = 'notauser';
        request.get(`${baseUrl}projects?user=${user}&token=${token}`,
        function(err, res, body) {
          const expectedResult = {
            error: 'Bad Query Value',
            text: 'Parameter user contained invalid value notauser',
            status: 400,
          };

          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);
          done();
        });
      });
    });
  });

  describe('GET /projects/:slug', function() {
    it('should return projects by slug', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'project1';
        request.get(`${baseUrl}projects/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = initialData.filter(p => {
            return p.slugs.indexOf(slug) >= 0;
          })[0];

          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    it('returns projects with default activities by slug', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'project-activity';
        request.get(`${baseUrl}projects/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = initialData.filter(p => {
            return p.slugs.indexOf(slug) >= 0;
          })[0];

          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    it('should fail with Object Not Found error', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}projects/404?token=${token}`,
        function(err, res, body) {
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent project',
          };

          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(404);
          done();
        });
      });
    });

    it('should fail with Invalid Slug error', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'test-!*@';
        request.get(`${baseUrl}projects/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: `Expected slug but received ${slug}`,
            values: [slug],
          };

          expect(JSON.parse(body)).to.eql(expectedResult);
          expect(res.statusCode).to.equal(400);

          done();
        });
      });
    });
  });

  describe('POST /projects', function() {
    // the project object to attempt to add
    const project = {
      uri: 'https://github.com/osuosl/pa-new',
      slugs: ['pa-new', 'project-activity-new'],
      name: 'Project With Activity New',
      default_activity: 'meeting',
      users: {
        Site_Manager: {member: true, spectator: true, manager: true},
        user1: {member: true, spectator: true, manager: false},
      },
    };

    // the project as added to the database
    const newProject = {
      uri: 'https://github.com/osuosl/pa-new',
      slugs: ['pa-new', 'project-activity-new'],
      name: 'Project With Activity New',
      default_activity: 'meeting',
      revision: 1,
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: null,
      deleted_at: null,
      users: {
        Site_Manager: {member: true, spectator: true, manager: true},
        user1: {member: true, spectator: true, manager: false},
      },
    };

    // The project as returned on GET
    const getProject = {
      uri: 'https://github.com/osuosl/pa-new',
      slugs: ['pa-new', 'project-activity-new'],
      name: 'Project With Activity New',
      default_activity: 'meeting',
      revision: 1,
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: null,
      deleted_at: null,
      users: {
        Site_Manager: {member: true, spectator: true, manager: true},
        user1: {member: true, spectator: true, manager: false},
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

    function checkListEndpoint(done, expectedResults, token) {
      request.get(`${baseUrl}projects?token=${token}`,
      function(err, res, body) {
        expect(err).to.equal(null);
        expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
        expect(res.statusCode).to.equal(200);
        done();
      });
    }

    it('successfully creates a new project with slugs by an admin',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedResult = copyJsonObject(getProject);
          expectedResult.uuid = body.uuid;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new project with slugs by a sitewide manager',
    function(done) {
      getAPIToken('Site_Manager', 'drowssap').then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedResult = copyJsonObject(getProject);
          expectedResult.uuid = body.uuid;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new project with no uri', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.uri;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          delete addedProject.uri;
          expect(body).to.deep.equal(addedProject);

          const expectedResult = copyJsonObject(getProject);
          expectedResult.uuid = body.uuid;
          expectedResult.uri = null;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new project with no users', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.users;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          delete addedProject.users;
          expect(body).to.deep.equal(addedProject);

          const expectedResult = copyJsonObject(getProject);
          expectedResult.uuid = body.uuid;
          delete expectedResult.users;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new project with a bad user', function(done) {
      getAPIToken().then(function(token) {
        const postBadUser = copyJsonObject(postArg);
        postBadUser.object.users.wasd =
                              {member: true, spectator: false, manager: false};
        requestOptions.body = postBadUser;

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          expect(body).to.deep.equal(addedProject);

          const expectedResult = copyJsonObject(getProject);
          expectedResult.uuid = body.uuid;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new project with no default activity',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.default_activity;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedProject = copyJsonObject(newProject);
          addedProject.uuid = body.uuid;
          delete addedProject.default_activity;
          expect(body).to.deep.equal(addedProject);

          const expectedResult = copyJsonObject(getProject);
          expectedResult.uuid = body.uuid;
          expectedResult.default_activity = null;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('fails to create a new project with bad authentication', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Authentication failure',
            status: 401,
            text: 'Bad API token',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with bad permissions', function(done) {
      getAPIToken('Site_Spectator', 'word').then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Authorization failure',
            status: 401,
            text: 'Site_Spectator is not authorized to create projects',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an invalid uri', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.uri = 'notauri';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field uri of project should be uri but was sent as non-uri' +
                  ' string',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an invalid slug', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.slugs = ['$*#*cat', 'dog', ')_!@#mouse'];

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field slugs of project should be slugs but was sent as ' +
                  'non-slug strings',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an existing slug', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        const slugs = ['p1', 'project1'];
        requestOptions.body.object.slugs = slugs;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'The slug provided already exists',
            status: 409,
            text: `slugs ${slugs.join(', ')} already exist`,
            values: slugs,
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with no slugs', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.slugs;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The project is missing a slugs',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with no name', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.name;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The project is missing a name',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with an existing name', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.name = 'Project2';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field name of project should be unique name but was sent ' +
                  'as name which already exists',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a project with bad slugs datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.slugs = {thisIs: 'the wrong data type'};

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field slugs of project should be array but was sent as ' +
                  'object',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a project with bad name datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.name = {thisIs: 'the wrong data type'};

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field name of project should be string but was sent as ' +
                  'object',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with non-existent default activity',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.default_activity = 'sleeping';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Invalid foreign key',
            status: 409,
            text: 'The project does not contain a valid activity reference.',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new project with bad default activity datatype',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.default_activity = {thisIs: 'wrong'};

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field default_activity of project should be string but ' +
                  'was sent as object',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a project with bad uri datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.uri = {thisIs: 'the wrong data type'};

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field uri of project should be string but was sent as ' +
                  'object',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });
  });

  // Tests Patching Projects
  describe('POST /projects/:slug', function() {
    // The database's entry for the project
    const postOriginalProject = {
      name: 'Project1',
      slugs: ['p1', 'project1'],
      uri: 'http://example.com/project1',
      default_activity: null,
    };

    const getOriginalProject = {
      name: 'Project1',
      slugs: ['p1', 'project1'],
      uri: 'http://example.com/project1',
      default_activity: null,
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      revision: 1,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
      users: {
        Proj_Manager: {member: true, spectator: true, manager: false},
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
      },
    };

    // A completely patched version of the above project
    const updatedAt = new Date().toISOString().substring(0, 10);
    const postPatchedProject = {
      name: 'Project 1 New',
      slugs: ['p1n', 'project1'],
      uri: 'http://example.com/p1n',
      default_activity: 'docs',
    };

    const getPatchedProject = {
      name: 'Project 1 New',
      slugs: ['p1n', 'project1'],
      uri: 'http://example.com/p1n',
      default_activity: 'docs',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      revision: 2,
      created_at: '2014-01-01',
      updated_at: updatedAt,
      deleted_at: null,
      users: {
        Proj_Manager: {member: true, spectator: true, manager: false},
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
      },
    };

    const invalidProjectDataType = {
      name: {thisIs: 'the wrong data type'},
      slugs: {thisIs: 'the wrong data type'},
      uri: {thisIs: 'the wrong data type'},
      default_activity: {thisIs: 'the wrong data type'},
    };

    const invalidProjectValue = {
      name: 'Project2',
      slugs: ['project-activity', 'project2'].sort(),
      uri: 'notauri',
      default_activity: 'notreal',
    };

    const patchedProjectNewMember = {users: {
      admin1: {member: true, spectator: true, manager: true},
      Site_Spectator: {member: true, spectator: true, manager: false},
      delProj_Manager: {member: true, spectator: true, manager: true},
      Proj_Manager: {member: true, spectator: true, manager: false},
      user1: {member: true, spectator: false, manager: false}, // Add user1
    }};
    const patchedProjectBadMember = {users: {
      admin1: {member: true, spectator: true, manager: true},
      Site_Spectator: {member: true, spectator: true, manager: false},
      delProj_Manager: {member: true, spectator: true, manager: true},
      Proj_Manager: {member: true, spectator: true, manager: false},
      wasd: {member: true, spectator: false, manager: false}, // no wasd
    }};
    const patchedProjectPromotion = {users: {
      admin1: {member: true, spectator: true, manager: true},
      // Site_Spectator now manager
      Site_Spectator: {member: true, spectator: true, manager: true},
      delProj_Manager: {member: true, spectator: true, manager: true},
      Proj_Manager: {member: true, spectator: true, manager: false},
    }};
    const patchedProjectDemotion = {users: {
      admin1: {member: true, spectator: true, manager: true},
      // Site_Spectator no longer spectator
      Site_Spectator: {member: true, spectator: false, manager: false},
      delProj_Manager: {member: true, spectator: true, manager: true},
      Proj_Manager: {member: true, spectator: true, manager: false},
    }};
    const patchedProjectSelfRemoval = {users: {
      Site_Spectator: {member: true, spectator: true, manager: false},
      delProj_Manager: {member: true, spectator: true, manager: true},
      Proj_Manager: {member: true, spectator: true, manager: false},
    }};

    const postArg = {
      auth: {
        type: 'token',
      },
    };

    const requestOptions = {
      url: baseUrl + 'projects/project1',
      json: true,
    };

    /*
     * Okay so here's the deal.
     * This endpoint has ~26 tests, which are honestly just 3 tests
     * repeated 7 or 8 times (with a few exceptions).
     * This function in theory gets rid of a lot of the repeated code in
     * the tests.
     * Without this function you would see this exact code pretty 26
     * times over.
     */
    function checkPostToEndpoint(done, uri, postObj, expectedResults, error,
    statusCode, postBodies, username, password) {
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
            expect(postBodies).to.deep.include(body);
          }

          // Always checks for valid get request
          // err is always 'null'
          // res.statusCode is always 200
          // body always equals expectedresults
          request.get(requestOptions.url + '?token=' + token,
          function(err0, res0, body0) {
            const jsonBody = JSON.parse(body0);
            expect(jsonBody.error).to.equal(undefined);
            expect(res0.statusCode).to.equal(200);
            expectedResults.updated_at = jsonBody.updated_at;
            expect(jsonBody).to.deep.equal(expectedResults);
            done();
          });
        });
      });
    }

    it("successfully patches a project's uri, slugs, name, and default " +
    'activity by an admin',
    function(done) {
      const postObj = copyJsonObject(postPatchedProject);
      const expectedResults = copyJsonObject(getPatchedProject);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, [expectedResults]);
    });

    it("successfully patches a project's uri, slugs, name, and " +
    'default_activity by a sitewide manager', function(done) {
      const postObj = copyJsonObject(postPatchedProject);
      const expectedResults = copyJsonObject(getPatchedProject);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, [expectedResults], 'Site_Manager', 'drowssap');
    });

    it("successfully patches a project's uri, slugs, name, and " +
    'default_activity by its manager',
    function(done) {
      const postObj = copyJsonObject(postPatchedProject);
      const expectedResults = copyJsonObject(getPatchedProject);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, [expectedResults], 'delProj_Manager', 'wording');
    });

    it("successfully patches a project's uri", function(done) {
      const postObj = {uri: postPatchedProject.uri};
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.uri = postPatchedProject.uri;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully patches a project's slugs", function(done) {
      const postObj = {slugs: postPatchedProject.slugs};
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.slugs = postPatchedProject.slugs;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully patches a project's name", function(done) {
      const postObj = {name: postPatchedProject.name};
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.name = postPatchedProject.name;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully adds a new member', function(done) {
      const postObj = patchedProjectNewMember;
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.users = patchedProjectNewMember.users;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully ignores nonexistent members', function(done) {
      const postObj = patchedProjectBadMember;
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully promotes an existing user', function(done) {
      const postObj = patchedProjectPromotion;
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.users = patchedProjectPromotion.users;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully demotes an existing user', function(done) {
      const postObj = patchedProjectDemotion;
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.users = patchedProjectDemotion.users;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully removes the calling user', function(done) {
      const postObj = patchedProjectSelfRemoval;
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.users = patchedProjectSelfRemoval.users;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("successfully patches a project's default activity", function(done) {
      const postObj = {default_activity: postPatchedProject.default_activity};
      const expectedResults = copyJsonObject(getOriginalProject);
      expectedResults.default_activity = postPatchedProject.default_activity;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it("doesn't patch a non-existent project", function(done) {
      const uri = baseUrl + 'projects/not-a-project';
      const postObj = {name: postPatchedProject.name};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent project',
      };

      checkPostToEndpoint(done, uri, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with invalid permissions", function(done) {
      const postObj = {name: postPatchedProject.name};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 401,
        error: 'Authorization failure',
        text: 'user1 is not authorized to make changes to Project1',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error], 'user1', 'passing');
    });

    it("doesn't patch a project with bad uri, name, slugs, and default " +
    'activity',
    function(done) {
      const postObj = copyJsonObject(invalidProjectValue);
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field uri of project should be uri but was sent as string',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field name of project should be string but was sent as array',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field slugs of project should be slugs but was sent as ' +
                'non-slug strings',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field default_activity of project should be string but was ' +
          'sent as number',
        },
      ];

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    it("doesn't patch a project with only bad uri", function(done) {
      const postObj = {uri: invalidProjectValue.uri};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field uri of project should be uri but was sent as string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with only bad slugs", function(done) {
      const postObj = {slugs: ['test-!@#']};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slugs of project should be slugs but was sent as ' +
              'non-slug strings',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with only bad name", function(done) {
      const postObj = {name: invalidProjectValue.name};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field name of project should be unique name but was sent as ' +
              'name which already exists',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with just bad default activity",
    function(done) {
      const postObj = {default_activity: invalidProjectValue.default_activity};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 409,
        error: 'Invalid foreign key',
        text: 'The project does not contain a valid activity reference.',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with wrong-type uri", function(done) {
      const postObj = {uri: invalidProjectDataType.uri};
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field uri of project should be string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with invalid uri", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.uri = invalidProjectValue.uri;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field uri of project should be uri but was sent as string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with invalid slugs", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.slugs = ['test-!@#', 'wr()ng!'];
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slugs of project should be slugs but was sent as ' +
              'non-slug strings',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with wrong-type slugs", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.slugs = invalidProjectDataType.slugs;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slugs of project should be array but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with missing slugs", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.slugs = [];
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slugs of project should be array of slugs but was ' +
              'sent as empty array',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with existent slugs", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.slugs = invalidProjectValue.slugs;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 409,
        error: 'The slug provided already exists',
        text: `slugs ${postObj.slugs.sort().join(', ')} already exist`,
        values: postObj.slugs.sort(),
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with wrong-type name", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.name = invalidProjectDataType.name;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field name of project should be string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with existing name", function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.name = invalidProjectValue.name;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field name of project should be unique name but was sent as ' +
              'name which already exists',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with non-existent default activity",
    function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.default_activity = invalidProjectValue.default_activity;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 409,
        error: 'Invalid foreign key',
        text: 'The project does not contain a valid activity reference.',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it("doesn't patch a project with wrong-type default activity",
    function(done) {
      const postObj = copyJsonObject(postOriginalProject);
      postObj.default_activity = invalidProjectDataType.default_activity;
      const expectedResults = copyJsonObject(getOriginalProject);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field default_activity of project should be string but was ' +
              'sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });
  });

  describe('DELETE /projects/:slug', function() {
    it('deletes the desired project if no times are associated with it',
    function(done) {
      getAPIToken().then(function(token) {
        const project = 'project-activity';
        request.del(`${baseUrl}projects/${project}?token=${token}`,
        function(err, res) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          request.get(`${baseUrl}projects/${project}?token=${token}`,
          function(getErr, getRes, getBody) {
            const expectedResult = {
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent project',
            };

            expect(JSON.parse(getBody)).to.deep.equal(expectedResult);
            expect(getRes.statusCode).to.equal(expectedResult.status);

            request.get(`${baseUrl}projects?token=${token}`,
            function(getErr0, getRes0, getBody0) {
              const expectedResults = initialData.filter(p => {
                return p.slugs.indexOf(project) < 0;
              });

              expect(getErr0).to.equal(null);
              expect(JSON.parse(getBody0)).to.deep.have.same
                                                      .members(expectedResults);
              expect(getRes0.statusCode).to.equal(200);
              done();
            });
          });
        });
      });
    });

    it('fails if it recieves a project with times associated', function(done) {
      getAPIToken().then(function(token) {
        const project = 'project2';
        request.del(`${baseUrl}projects/${project}?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 405,
            error: 'Method not allowed',
            text: 'The method specified is not allowed for ' +
            'the project identified',
          };

          expect(res.headers.allow).to.equal('GET, POST');
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}projects/${project}?token=${token}`,
          function(getErr, getRes, getBody) {
            const expectedResult = initialData.filter(p => {
              return p.slugs.indexOf(project) >= 0;
            })[0];

            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal(expectedResult);
            expect(getRes.statusCode).to.equal(200);

            request.get(`${baseUrl}projects?token=${token}`,
            function(getErr0, getRes0, getBody0) {
              expect(getRes.statusCode).to.equal(200);
              expect(JSON.parse(getBody0)).to.deep.have.same
                                                      .members(initialData);
              done();
            });
          });
        });
      });
    });

    it('fails if it receives an invalid project', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'Not.a!project';
        request.del(`${baseUrl}projects/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: `Expected slug but received ${slug}`,
            values: [slug],
          };

          expect(res.statusCode).to.equal(expectedResult.status);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);

          request.get(baseUrl + 'projects?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails if it receives a non-existent project', function(done) {
      getAPIToken().then(function(token) {
        request.del(baseUrl + 'projects/doesntexist?token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent slug',
          };

          expect(res.statusCode).to.equal(expectedResult.status);
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

    it('fails with bad permissions', function(done) {
      getAPIToken('Site_Spectator', 'word').then(function(token) {
        const slug = 'project-activity';
        request.del(`${baseUrl}projects/${slug}?token=${token}`,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedError = {
            status: 401,
            error: 'Authorization failure',
            text: `Site_Spectator is not authorized to delete project ${slug}`,
          };

          expect(jsonBody).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}projects/${slug}?token=${token}`,
          function(getErr, getRes, getBody) {
            const expectedResult = initialData.filter(p => {
              return p.slugs.indexOf(slug) >= 0;
            })[0];
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal(expectedResult);
            expect(getRes.statusCode).to.equal(200);

            request(`${baseUrl}projects?token=${token}`,
            function(getErr0, getRes0, getBody0) {
              expect(getRes0.statusCode).to.equal(200);
              expect(JSON.parse(getBody0)).to.deep.have.same
                                                        .members(initialData);
              done();
            });
          });
        });
      });
    });
  });

  describe('GET /projects/?include_revisions', function() {
    const currentTime = new Date().toISOString().substring(0, 10);

    const noParentsData = {
      uri: 'http://example.com/project1',
      name: 'Project1',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['p1', 'project1'],
      users: {
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
        Proj_Manager: {member: true, spectator: true, manager: false},
      },
    };

    const withParentsData = {
      uri: 'http://example.com/project1',
      name: 'Project1',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['p1', 'project1'],
      users: {
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
        Proj_Manager: {member: true, spectator: true, manager: false},
      },
      'parents': [
        {
          uri: 'http://example.com/project1',
          name: 'Project1',
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

      const project = 'project1';
      const postProject = {
        name: 'Project1',
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
    const project = 'project1';

    const noParentsData = {
      uri: 'http://example.com/project1',
      name: 'Project1',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['p1', 'project1'],
      users: {
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
        Proj_Manager: {member: true, spectator: true, manager: false},
      },
    };

    const withParentsData = {
      uri: 'http://example.com/project1',
      name: 'Project1',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      default_activity: null,
      revision: 2,
      deleted_at: null,
      updated_at: currentTime,
      created_at: '2014-01-01',
      slugs: ['p1', 'project1'],
      users: {
        admin1: {member: true, spectator: true, manager: true},
        Site_Spectator: {member: true, spectator: true, manager: false},
        delProj_Manager: {member: true, spectator: true, manager: true},
        Proj_Manager: {member: true, spectator: true, manager: false},
      },
      'parents': [
        {
          uri: 'http://example.com/project1',
          name: 'Project1',
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
        name: 'Project1',
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

  describe('Interconnectedness', function() {
    it("doesn't break when activities are updated", function(done) {
      getAPIToken().then(function(token) {
        const postData = {
          url: `${baseUrl}activities/dev`,
          json: true,
          body: {
            auth: {
              type: 'token',
              token: token,
            },
            object: {
              name: 'Development Updated',
            },
          },
        };

        const uuid = '1f8788bd-0909-4397-be2c-79047f90c575';
        const expectedResult = initialData.filter((p) => {
          return p.uuid === uuid;
        })[0];
        const slug = expectedResult.slugs[0];
        request.get(`${baseUrl}projects/${slug}?token=${token}`,
        function(firstErr, firstRes, firstBody) {
          expect(firstErr).to.equal(null);
          expect(firstRes.statusCode).to.equal(200);
          expect(JSON.parse(firstBody)).to.deep.equal(expectedResult);

          request.post(postData, function(postErr, postRes, postBody) {
            expect(postErr).to.equal(null);
            expect(postRes.statusCode).to.equal(200);

            expect(postBody).to.have.property('name', 'Development Updated');

            request.get(`${baseUrl}projects/${slug}?token=${token}`,
            function(secondErr, secondRes, secondBody) {
              expect(secondErr).to.equal(null);
              expect(secondRes.statusCode).to.equal(200);
              expect(JSON.parse(secondBody)).to.deep.equal(expectedResult);

              done();
            });
          });
        });
      });
    });
  });
};
