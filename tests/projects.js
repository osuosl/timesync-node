'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without effecting other tests
  return JSON.parse(JSON.stringify(obj));
}

module.exports = function(expect, request, baseUrl) {
  /* GET one of the /projects endpoints and check its response against
  what should be returned */
  describe('GET /projects', function() {
    it('should return all projects in the database', function(done) {
      request.get(baseUrl + 'projects', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResults = [
          {
            uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
            name: 'Ganeti Web Manager',
            slugs: ['ganeti-webmgr', 'gwm'],
            owner: 'tschuy',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
            revision: 1,
          },
          {
            uri: 'https://code.osuosl.org/projects/pgd',
            name: 'Protein Geometry Database',
            slugs: ['pgd'],
            owner: 'deanj',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
            revision: 1,
          },
          {
            uri: 'https://github.com/osu-cass/whats-fresh-api',
            name: 'Whats Fresh',
            slugs: ['wf'],
            owner: 'tschuy',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
            revision: 1,
          },
          {
            uri: 'https://github.com/osuosl/timesync',
            name: 'Timesync',
            slugs: ['timesync', 'ts'],
            owner: 'patcht',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
            revision: 1,
          },
        ];

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        [expectedResults, jsonBody].forEach(function(list) {
          list.forEach(function(result) {
            result.slugs.sort();
          });
        });

        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });
  });

  describe('GET /projects?include_deleted=:bool', function() {
    it('returns a list of all active and deleted projects', function(done) {
      request.get(baseUrl + 'projects?include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResults = [
          {
            uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
            name: 'Ganeti Web Manager',
            slugs: ['ganeti-webmgr', 'gwm'],
            owner: 'tschuy',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
            revision: 1,
          },
          {
            uri: 'https://code.osuosl.org/projects/pgd',
            name: 'Protein Geometry Database',
            slugs: ['pgd'],
            owner: 'deanj',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
            revision: 1,
          },
          {
            uri: 'https://github.com/osu-cass/whats-fresh-api',
            name: 'Whats Fresh',
            slugs: ['wf'],
            owner: 'tschuy',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
            revision: 1,
          },
          {
            uri: 'https://github.com/osuosl/timesync',
            name: 'Timesync',
            slugs: ['timesync', 'ts'],
            owner: 'patcht',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
            revision: 1,
          },
          {
            uri: 'https://github.com/osuosl/chiliproject',
            name: 'Chili Project',
            slugs: [],
            owner: 'MaraJade',
            deleted_at: '2014-01-01',
            updated_at: null,
            created_at: '2009-07-07',
            uuid: '6abe7f9a-2c4b-4c1d-b4f9-1222b47b8a29',
            revision: 1,
          },
        ];

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });

    /* Tests that a nonexistent query parameter is ignored
     *
     * Users cannot query for a project by its slug in a querystring parameter.
     * But querying for deleted projects is similar to querying for times, so
     * the mistake may be relatively easy to make. Hence, the following. */
    it('ignores extra param if user specifies query with a projectslug',
    function(done) {
      request.get(baseUrl + 'projects?project=chili&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResults = [
          {
            uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
            name: 'Ganeti Web Manager',
            slugs: ['ganeti-webmgr', 'gwm'],
            owner: 'tschuy',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
            revision: 1,
          },
          {
            uri: 'https://code.osuosl.org/projects/pgd',
            name: 'Protein Geometry Database',
            slugs: ['pgd'],
            owner: 'deanj',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
            revision: 1,
          },
          {
            uri: 'https://github.com/osu-cass/whats-fresh-api',
            name: 'Whats Fresh',
            slugs: ['wf'],
            owner: 'tschuy',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
            revision: 1,
          },
          {
            uri: 'https://github.com/osuosl/timesync',
            name: 'Timesync',
            slugs: ['timesync', 'ts'],
            owner: 'patcht',
            deleted_at: null,
            updated_at: null,
            created_at: '2014-01-01',
            uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
            revision: 1,
          },
          {
            uri: 'https://github.com/osuosl/chiliproject',
            name: 'Chili Project',
            slugs: [],
            owner: 'MaraJade',
            deleted_at: '2014-01-01',
            updated_at: null,
            created_at: '2009-07-07',
            uuid: '6abe7f9a-2c4b-4c1d-b4f9-1222b47b8a29',
            revision: 1,
          },
        ];

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });

    // Soft-deleted projects don't have any associated slugs, which makes the
    // following query invalid
    it('returns an error if user specifies with /projects/:slug endpoint',
    function(done) {
      request.get(baseUrl + 'projects/chili?include_deleted=true',
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

  describe('GET /projects/:slug', function() {
    it('should return projects by slug', function(done) {
      request.get(baseUrl + 'projects/gwm', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
          name: 'Ganeti Web Manager',
          slugs: ['gwm', 'ganeti-webmgr'].sort(),
          owner: 'tschuy',
          deleted_at: null,
          updated_at: null,
          created_at: '2014-01-01',
          uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
          revision: 1,
        };
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('should fail with Object Not Found error', function(done) {
      request.get(baseUrl + 'projects/404', function(err, res, body) {
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

    it('should fail with Invalid Slug error', function(done) {
      request.get(baseUrl + 'projects/test-!*@', function(err, res, body) {
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

  // Tests Patching Projects
  describe('POST /projects/:slug', function() {
    const patchedProject = {
      name: 'Ganeti Web Mgr',
      owner: 'tschuy',
      slugs: ['gwm', 'gan-web'].sort(),
      uri: 'https://code.osuosl.org/projects/',
    };

    const originalProject = {

      name: 'Ganeti Web Manager',
      owner: 'tschuy',
      slugs: ['gwm', 'ganeti-webmgr'].sort(),
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
      uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
      revision: 1,
    };

    const patchedProjectName = {name: patchedProject.name};
    // const patchedProjectOwner = {owner: patchedProject.owner};
    const patchedProjectUri = {uri: patchedProject.uri};
    const patchedProjectSlugs = {slugs: patchedProject.slugs};

    const badProject = {
      name: ['a name'],
      owner: ['a owner'],
      uri: ['a website'],
      slugs: 'a slug',
      key: 'value',
    };

    const badProjectName = {name: badProject.name};
    const badProjectOwner = {owner: badProject.owner};
    const badProjectUri = {uri: badProject.uri};
    const badProjectSlugs = {slugs: badProject.slugs};
    const badProjectKey = {key: 'value' };

    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
        type: 'password',
      },
    };

    const requestOptions = {
      url: baseUrl + 'projects/gwm',
      json: true,
    };

    // Function used for validating that the object in the database
    // is in the correct state (change or unchanged based on if the POST
    // was valid)
    const checkListEndpoint = function(done, expectedResults) {
      // Make a get request
      request.get(requestOptions.url, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const jsonBody = JSON.parse(body);
        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    };

    it("successfully patches a project's uri, slugs, owner, and name",
    function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProject);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        // Set expected results to the new state of the project gwm
        const expectedResults = copyJsonObject(originalProject);
        expectedResults.name = patchedProject.name;
        expectedResults.uri = patchedProject.uri;
        expectedResults.slugs = patchedProject.slugs;
        expectedResults.owner = patchedProject.owner;
        expectedResults.uuid = originalProject.uuid;
        expectedResults.revision = 2;
        expectedResults.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResults);
        delete expectedPost.deleted_at;

        // expect body of post request to be the new state of gwm
        expect(body).to.deep.equal(expectedPost);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("successfully patches a project's uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProjectUri);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const expectedResults = copyJsonObject(originalProject);
        expectedResults.uri = patchedProject.uri;
        expectedResults.uuid = originalProject.uuid;
        expectedResults.revision = 2;
        expectedResults.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResults);
        delete expectedPost.deleted_at;

        // expect body of post request to be the new state of gwm
        body.slugs.sort();
        expect(body).to.deep.equal(expectedPost);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("successfully patches a project's slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProjectSlugs);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const expectedResults = copyJsonObject(originalProject);
        expectedResults.slugs = patchedProject.slugs;
        expectedResults.uuid = originalProject.uuid;
        expectedResults.revision = 2;
        expectedResults.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResults);
        delete expectedPost.deleted_at;

        body.slugs.sort();
        // expect body of post request to be the new state of gwm
        expect(body).to.deep.equal(expectedPost);

        checkListEndpoint(done, expectedResults);
      });
    });

    it("successfully patches a project's name", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProjectName);

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const expectedResults = copyJsonObject(originalProject);
        expectedResults.name = patchedProject.name;
        expectedResults.uuid = originalProject.uuid;
        expectedResults.revision = 2;
        expectedResults.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResults);
        delete expectedPost.deleted_at;

        body.slugs.sort();
        // expect body of post request to be the new state of gwm
        expect(body).to.deep.equal(expectedPost);

        checkListEndpoint(done, expectedResults);
      });
    });

    // This test should be reenabled when administrator users are added
    //     it("successfully patches a project's owner", function(done) {
    //         postArg.object = copyJsonObject(patchedProjectOwner);
    //         requestOptions.form = copyJsonObject(postArg);
    //
    //         request.post(requestOptions, function(err, res, body) {
    //             expect(err).to.be.a('null');
    //             expect(res.statusCode).to.equal(200);
    //
    //             const expectedResults = copyJsonObject(originalProject);
    //             expectedResults.owner = patchedProject.owner;
    //
    //             body = JSON.parse(body);
    //
    //             expect(body).to.equal(expectedResults);
    //
    //             checkListEndpoint(done, expectedResults);
    //         });
    //     });

    it("doesn't patch a project with bad authentication", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(patchedProject);
      requestOptions.form.auth.password = 'not correct password';

      request.post(requestOptions, function(err, res, body) {
        expect(res.statusCode).to.equal(401);

        expect(body.error).to.equal('Authentication failure');
        expect(body.text).to.equal('Incorrect password.');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid permissions", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.auth.username = 'patcht';
      requestOptions.form.auth.password = 'drowssap';
      requestOptions.form.object = copyJsonObject(patchedProject);

      request.post(requestOptions, function(err, res, body) {
        expect(res.statusCode).to.equal(401);

        expect(body.error).to.equal('Authorization failure');
        expect(body.text).to.equal('patcht is not authorized to make changes' +
          ' to ' + originalProject.name);

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with bad uri, name, slugs, and owner",
    function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProject);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);

        expect([
          'Field uri of project should be string but was sent as ' +
          'array',
          'Field name of project should be string but was sent as ' +
          'array',
          'Field owner of project should be string but was sent as ' +
          'array',
          'Field slugs of project should be array but was sent as ' +
          'string',
          'project does not have a key field',
        ]).to.include.members([body.text]);

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with only bad uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = badProjectUri;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of project' +
        ' should be string but was sent as array');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with only bad slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectSlugs);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of' +
        ' project should be array but was sent as string');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with only bad name", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectName);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field name of' +
        ' project should be string but was sent as array');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with just bad owner", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectOwner);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field owner of' +
        ' project should be string but was sent as array');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with just invalid key", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(badProjectKey);

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('project does not' +
        ' have a key field');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.uri = badProject.uri;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of project' +
        ' should be string but was sent as array');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid uri", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.uri = 'string but not uri';

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of project' +
        ' should be uri but was sent as string');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.slugs = ['@#SAfsda', '232sa$%'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of project' +
        ' should be slugs but was sent as non-slug strings');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type slugs", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.slugs = badProject.slugs;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of' +
        ' project should be array but was sent as string');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type name", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.name = badProject.name;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field name of' +
        ' project should be string but was sent as array');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with wrong-type owner", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.owner = badProject.owner;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field owner of' +
        ' project should be string but was sent as array');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });

    it("doesn't patch a project with invalid key", function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(originalProject);
      delete requestOptions.form.object.uuid;
      delete requestOptions.form.object.revision;
      delete requestOptions.form.object.deleted_at;
      delete requestOptions.form.object.updated_at;
      delete requestOptions.form.object.created_at;
      requestOptions.form.object.key = badProject.key;

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('project does not' +
        ' have a key field');

        const expectedResults = copyJsonObject(originalProject);
        checkListEndpoint(done, expectedResults);
      });
    });
  });

  describe('POST /projects', function() {
    // the project object to attempt to add
    const project = {
      uri: 'https://github.com/osuosl/timesync-node',
      owner: 'tschuy',
      slugs: ['tsn', 'timesync-node'].sort(),
      name: 'TimeSync Node',
    };

    // the project as added to the database
    const newProject = {
      uri: 'https://github.com/osuosl/timesync-node',
      owner: 'tschuy',
      slugs: ['tsn', 'timesync-node'].sort(),
      name: 'TimeSync Node',
      revision: 1,
      created_at: new Date().toISOString().substring(0, 10),
    };

    // the base POST JSON
    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
        type: 'password',
      },
      object: project,
    };

    const initialProjects = [
      {
        uri: 'https://code.osuosl.org/projects/' +
        'ganeti-webmgr',
        name: 'Ganeti Web Manager',
        slugs: ['gwm', 'ganeti-webmgr'].sort(),
        owner: 'tschuy',
        deleted_at: null,
        updated_at: null,
        created_at: '2014-01-01',
        uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
        revision: 1,
      },
      {
        uri: 'https://code.osuosl.org/projects/pgd',
        name: 'Protein Geometry Database',
        slugs: ['pgd'],
        owner: 'deanj',
        deleted_at: null,
        updated_at: null,
        created_at: '2014-01-01',
        uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
        revision: 1,
      },
      {
        uri: 'https://github.com/osu-cass/whats-fresh-api',
        name: 'Whats Fresh',
        slugs: ['wf'],
        owner: 'tschuy',
        deleted_at: null,
        updated_at: null,
        created_at: '2014-01-01',
        uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
        revision: 1,
      },
      {
        uri: 'https://github.com/osuosl/timesync',
        name: 'Timesync',
        slugs: ['timesync', 'ts'].sort(),
        owner: 'patcht',
        deleted_at: null,
        updated_at: null,
        created_at: '2014-01-01',
        uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
        revision: 1,
      },
    ];

    const requestOptions = {
      url: baseUrl + 'projects/',
      json: true,
      method: 'POST',
    };

    function checkListEndpoint(done) {
      request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);

        const jsonGetBody = JSON.parse(getBody);
        // the projects/ list shouldn't have changed
        expect(jsonGetBody).to.deep.have.same.members(initialProjects);
        done();
      });
    }

    it('successfully creates a new project with slugs', function(done) {
      requestOptions.form = postArg;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const addedProject = copyJsonObject(newProject);
        addedProject.uuid = body.uuid;
        expect(body).to.deep.equal(addedProject);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          // the projects/ endpoint should now have one more project
          const expectedGetResults = initialProjects.concat([
            {
              owner: 'tschuy',
              uri: 'https://github.com/osuosl/timesync-node',
              slugs: ['tsn', 'timesync-node'].sort(),
              name: 'TimeSync Node',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
            },
          ]);

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          expect(JSON.parse(getBody))
          .to.have.same.deep.members(expectedGetResults);
          done();
        });
      });
    });

    it('successfully creates a new project with no uri', function(done) {
      // remove uri from post data
      const postNoUri = copyJsonObject(postArg);
      postNoUri.object.uri = undefined;
      requestOptions.form = postNoUri;

      // remove uri from test object
      const newProjectNoUri = copyJsonObject(newProject);
      delete newProjectNoUri.uri;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const addedProject = copyJsonObject(newProjectNoUri);
        addedProject.uuid = body.uuid;
        expect(body).to.deep.equal(addedProject);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          // the projects/ endpoint should now have one more project
          const expectedGetResults = initialProjects.concat([
            {
              owner: 'tschuy',
              uri: null,
              slugs: ['tsn', 'timesync-node'].sort(),
              name: 'TimeSync Node',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              revision: 1,
              uuid: addedProject.uuid,
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

    it('fails to create a new project with bad authentication', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(newProject);
      requestOptions.form.auth.password = 'not correct password';

      request.post(requestOptions, function(err, res, body) {
        expect(res.statusCode).to.equal(401);

        expect(body.error).to.equal('Authentication failure');
        expect(body.text).to.equal('Incorrect password.');

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an invalid uri', function(done) {
      const postInvalidUri = copyJsonObject(postArg);
      postInvalidUri.object.uri = "Ceci n'est pas un url";
      requestOptions.form = postInvalidUri;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field uri of project should be uri but was sent as ' +
          'non-uri string',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          // the projects/ list shouldn't have changed
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an invalid slug', function(done) {
      const postInvalidSlug = copyJsonObject(postArg);
      // of these slugs, only 'dog' is valid
      postInvalidSlug.object.slugs = ['$*#*cat', 'dog', ')_!@#mouse'];
      requestOptions.form = postInvalidSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field slugs of project should be slugs but was sent as ' +
          'non-slug strings',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          // the projects/ list shouldn't have changed
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an existing slug', function(done) {
      const postExistingSlug = copyJsonObject(postArg);
      postExistingSlug.object.slugs = ['gwm', 'ganeti-webmgr', 'dog'].sort();
      requestOptions.form = postExistingSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 409,
          error: 'The slug provided already exists',
          text: 'slugs gwm, ganeti-webmgr already exist',
          values: ['gwm', 'ganeti-webmgr'],
        };

        body.values.sort();
        expectedError.values.sort();

        if (body.text.substring(0, 10) === 'slugs gane') {
          expectedError.text = 'slugs ganeti-webmgr, gwm already exist';
        }

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(409);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          // the projects/ list shouldn't have changed
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with no slugs', function(done) {
      const postNoSlug = copyJsonObject(postArg);
      postNoSlug.object.slugs = undefined;
      requestOptions.form = postNoSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'The project is missing a slug',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          // the projects/ list shouldn't have changed
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with no name', function(done) {
      const postNoName = copyJsonObject(postArg);
      postNoName.object.name = undefined;
      requestOptions.form = postNoName;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'The project is missing a name',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          // the projects/ list shouldn't have changed
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a new project with an owner different from auth',
    function(done) {
      const postOtherOwner = copyJsonObject(postArg);
      postOtherOwner.object.owner = 'deanj';
      requestOptions.form = postOtherOwner;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 401,
          error: 'Authorization failure',
          text: 'tschuy is not authorized to create objects for deanj',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(401);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          // the projects/ list shouldn't have changed
          expect(jsonGetBody).to.deep.have.same.members(initialProjects);
          done();
        });
      });
    });

    it('fails to create a project with bad owner datatype', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object.owner = ['test'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field owner of' +
        ' project should be string but was sent as array');

        checkListEndpoint(done);
      });
    });

    it('fails to create a project with bad slugs datatype', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object.slugs = 'test';

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slugs of' +
        ' project should be array but was sent as string');

        checkListEndpoint(done);
      });
    });

    it('fails to create a project with bad name datatype', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object.name = ['test'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field name of' +
        ' project should be string but was sent as array');

        checkListEndpoint(done);
      });
    });

    it('fails to create a project with bad uri datatype', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object.uri = ['test'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field uri of' +
        ' project should be string but was sent as array');

        checkListEndpoint(done);
      });
    });
  });

  describe('DELETE /projects/:slug', function() {
    it('deletes the desired project if no times are associated with it',
    function(done) {
      request.del(baseUrl + 'projects/ts', function(err, res) {
        expect(res.statusCode).to.equal(200);
        request.get(baseUrl + 'projects/ts', function(getErr, getRes, getBody) {
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

    it('Fails if it recieves a project with times associated', function(done) {
      request.del(baseUrl + 'projects/pgd', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 405,
          error: 'Method not allowed',
          text: 'The method specified is not allowed for ' +
          'the project identified',
        };

        expect(res.statusCode).to.equal(405);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('Fails if it receives an invalid project', function(done) {
      request.del(baseUrl + 'projects/Not.a!project', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected slug but received Not.a!project',
          values: ['Not.a!project'],
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          const jsonGetBody = JSON.parse(getBody);
          const expectedGetResult = [
            {
              uri: 'https://code.osuosl.org/projects/ganeti-' +
              'webmgr',
              name: 'Ganeti Web Manager',
              slugs: ['gwm', 'ganeti-webmgr'].sort(),
              owner: 'tschuy',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
              revision: 1,
            },
            {
              uri: 'https://code.osuosl.org/projects/pgd',
              name: 'Protein Geometry Database',
              slugs: ['pgd'],
              owner: 'deanj',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
              revision: 1,
            },
            {
              uri: 'https://github.com/osu-cass/whats-fresh-api',
              name: 'Whats Fresh',
              slugs: ['wf'],
              owner: 'tschuy',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
              revision: 1,
            },
            {
              uri: 'https://github.com/osuosl/timesync',
              name: 'Timesync',
              slugs: ['timesync', 'ts'].sort(),
              owner: 'patcht',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
              revision: 1,
            },
          ];

          expect(getRes.statusCode).to.equal(200);
          expect(jsonGetBody).to.deep.have.same.members(expectedGetResult);

          done();
        });
      });
    });

    it('Fails if it receives an non-existent project', function(done) {
      request.del(baseUrl + 'projects/doesntexist', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent slug',
        };

        expect(res.statusCode).to.equal(404);
        expect(jsonBody).to.deep.equal(expectedResult);

        request.get(baseUrl + 'projects', function(getErr, getRes, getBody) {
          const jsonGetBody = JSON.parse(getBody);
          const expectedGetResult = [
            {
              uri: 'https://code.osuosl.org/projects/ganeti-' +
              'webmgr',
              name: 'Ganeti Web Manager',
              slugs: ['gwm', 'ganeti-webmgr'].sort(),
              owner: 'tschuy',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: 'c285963e-192b-4e99-9d92-a940519f1fbd',
              revision: 1,
            },
            {
              uri: 'https://code.osuosl.org/projects/pgd',
              name: 'Protein Geometry Database',
              slugs: ['pgd'],
              owner: 'deanj',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: 'e3e25e6a-5e45-4df2-8561-796b07e8f974',
              revision: 1,
            },
            {
              uri: 'https://github.com/osu-cass/whats-fresh-api',
              name: 'Whats Fresh',
              slugs: ['wf'],
              owner: 'tschuy',
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: '9369f959-26f2-490d-8721-2948c49c3c09',
              revision: 1,
            },
            {
              uri: 'https://github.com/osuosl/timesync',
              name: 'Timesync',
              slugs: ['timesync', 'ts'].sort(),
              owner: 'patcht',
              revision: 1,
              deleted_at: null,
              updated_at: null,
              created_at: '2014-01-01',
              uuid: '1f8788bd-0909-4397-be2c-79047f90c575',
            },
          ];

          expect(getRes.statusCode).to.equal(200);
          expect(jsonGetBody).to.deep.have.same.members(expectedGetResult);
          done();
        });
      });
    });
  });

  describe('GET /projects/?include_revisions', function() {
    const currentTime = new Date().toISOString().substring(0, 10);

    const noParentsData = {
      'uri': 'https://code.osuosl.org/projects/ganeti-webmgr',
      'name': 'GANETI WEB MANAGER',
      'owner': 'tschuy',
      'uuid': 'c285963e-192b-4e99-9d92-a940519f1fbd',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
      'slugs': ['gwm', 'ganeti-webmgr'].sort(),
    };

    const withParentsData = {
      'uri': 'https://code.osuosl.org/projects/ganeti-webmgr',
      'name': 'GANETI WEB MANAGER',
      'owner': 'tschuy',
      'uuid': 'c285963e-192b-4e99-9d92-a940519f1fbd',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
      'slugs': ['gwm', 'ganeti-webmgr'].sort(),
      'parents': [
        {
          'uri': 'https://code.osuosl.org/projects/ganeti-webmgr',
          'name': 'Ganeti Web Manager',
          'owner': 'tschuy',
          'uuid': 'c285963e-192b-4e99-9d92-a940519f1fbd',
          'revision': 1,
          'deleted_at': null,
          'updated_at': null,
          'created_at': '2014-01-01',
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
              type: 'password',
              username: 'tschuy',
              password: 'password',
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

      request.post(postArg, function() {
        done();
      });
    });

    // Tests that include_revisions=true includes revisions
    it('gets projects + revisions when include_revisions=true', function(done) {
      request.get(baseUrl + 'projects/?include_revisions=true',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(withParentsData);
        expect(JSON.parse(body)).to.not.include(noParentsData);
        done();
      });
    });

    // Tests that include_revisions includes revisions
    it('gets projects + revisions when include_revisions is an empty parameter',
    function(done) {
      request.get(baseUrl + 'projects/?include_revisions',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(withParentsData);
        expect(JSON.parse(body)).to.not.include(noParentsData);
        done();
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just projects when include_revisions=false', function(done) {
      request.get(baseUrl + 'projects/?include_revisions=false',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(noParentsData);
        done();
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just projects when include_revisions is not set', function(done) {
      request.get(baseUrl + 'projects/', function(err, res, body) {
        expect(JSON.parse(body)).to.include(noParentsData);
        done();
      });
    });
  });

  describe('GET /projects/:uuid?include_revisions', function() {
    const currentTime = new Date().toISOString().substring(0, 10);
    const project = 'gwm';

    const noParentsData = {
      'uri': 'https://code.osuosl.org/projects/ganeti-webmgr',
      'name': 'GANETI WEB MANAGER',
      'owner': 'tschuy',
      'uuid': 'c285963e-192b-4e99-9d92-a940519f1fbd',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
      'slugs': ['gwm', 'ganeti-webmgr'].sort(),
    };

    const withParentsData = {
      'uri': 'https://code.osuosl.org/projects/ganeti-webmgr',
      'name': 'GANETI WEB MANAGER',
      'owner': 'tschuy',
      'uuid': 'c285963e-192b-4e99-9d92-a940519f1fbd',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
      'slugs': ['gwm', 'ganeti-webmgr'].sort(),
      'parents': [
        {
          'uri': 'https://code.osuosl.org/projects/ganeti-webmgr',
          'name': 'Ganeti Web Manager',
          'owner': 'tschuy',
          'uuid': 'c285963e-192b-4e99-9d92-a940519f1fbd',
          'revision': 1,
          'deleted_at': null,
          'updated_at': null,
          'created_at': '2014-01-01',
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
              type: 'password',
              username: 'tschuy',
              password: 'password',
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

      request.post(postArg, function() {
        done();
      });
    });

    // Tests that include_revisions=true includes revisions
    it('gets project + revisions when include_revisions=true',
    function(done) {
      request.get(baseUrl + 'projects/' + project + '?include_revisions=true',
      function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(withParentsData);
        done();
      });
    });

    // Tests that include_revisions includes revisions
    it('gets project + revisions when include_revisions',
    function(done) {
      request.get(baseUrl + 'projects/' + project + '?include_revisions',
      function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(withParentsData);
        done();
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just project when include_revisions=false', function(done) {
      request.get(baseUrl + 'projects/' + project + '?include_revisions=false',
      function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(noParentsData);
        done();
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just project when include_revisions is not set', function(done) {
      request.get(baseUrl + 'projects/' + project, function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(noParentsData);
        done();
      });
    });
  });
};
