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
      name: 'Documentation',
      slug: 'docs',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      revision: 1,
    },
    {
      name: 'Development',
      slug: 'dev',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: 'b0b8c83b-f529-4130-93ef-e4e94e5bc57e',
      revision: 1,
    },
    {
      name: 'Systems',
      slug: 'sys',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '504796fd-859d-4edd-b2b8-b4109bb1fdf2',
      revision: 1,
    },
    {
      name: 'Meetings',
      slug: 'meeting',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '6552d14e-12eb-4f1f-83d5-147f8452614c',
      revision: 1,
    },
    {
      name: 'Code Review',
      slug: null,
      deleted_at: '2014-03-01',
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '384e8177-2123-4578-8201-031199a3a58f',
      revision: 1,
    },
  ];

  const initialData = initialDataWithDeleted.filter(a => {
    return a.deleted_at === null;
  });

  /* GET one of the /activities endpoints and check its response against
  what should be returned */
  describe('GET /activities', function() {
    it('should return all activities in the database', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities?token=${token}`,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.have.same.members(initialData);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });
  });

  describe('GET /activities/:slug', function() {
    it('should return activities by slug', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'sys';
        request.get(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = initialData.filter(a => {
            return a.slug === slug;
          })[0];

          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    it('should fail with Object not found error', function(done) {
      getAPIToken().then(function(token) {
        const slug = '404';
        request.get(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent activity',
          };

          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          done();
        });
      });
    });

    it('should fail with Invalid Slug error', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'test-!*@';
        request.get(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedResult = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: `Expected slug but received ${slug}`,
            values: [slug],
          };

          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET /activities?include_deleted=:bool', function() {
    it('returns a list of all active and deleted activities', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities?include_deleted=true&token=${token}`,
        function(err, res, body) {
          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.have.same
                                              .members(initialDataWithDeleted);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    // Refer to API Docs: Bad Query Value - The activityslug parameter is
    // ignored, but since 'include_deleted=true', return the list of activities
    it('ignores extra param if user specifies query with an activityslug',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities?activity=review&` +
        `include_deleted=true&token=${token}`, function(err, res, body) {
          expect(err).to.equal(null);
          expect(JSON.parse(body)).to.deep.have.same
                                              .members(initialDataWithDeleted);
          expect(res.statusCode).to.equal(200);
          done();
        });
      });
    });

    it('returns an error if user specifies with /activities/:slug endpoint',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities/review?include_deleted=true&` +
        `token=${token}`, function(err, res, body) {
          const expectedResult = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent activity',
          };

          expect(JSON.parse(body)).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);
          done();
        });
      });
    });
  });

  describe('GET /activities/?include_revisions=true', function() {
    const currentTime = new Date().toISOString().substring(0, 10);

    const noParentsData = {
      'name': 'Documentationification',
      'slug': 'docs',
      'uuid': '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
    };

    const withParentsData = {
      'name': 'Documentationification',
      'slug': 'docs',
      'uuid': '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
      'parents': [
        {
          'name': 'Documentation',
          'slug': 'docs',
          'uuid': '986fe650-4bef-4e36-a99d-ad880b7f6cad',
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
              type: 'token',
            },
            object: obj,
          },
        };
      }

      const activity = 'docs';
      const postActivity = {
        'name': 'Documentationification',
      };
      const postArg = getPostObject(`${baseUrl}activities/${activity}`,
                      postActivity);

      getAPIToken().then(function(token) {
        postArg.body.auth.token = token;
        request.post(postArg, function(err, res, body) {
          expect(err).to.equal(null);
          expect(body.error).to.equal(undefined);
          expect(res.statusCode).to.equal(200);
          expect(body.name).to.equal(postActivity.name);
          done();
        });
      });
    });

    // Tests that `include_revisions=true` includes revisions
    it('gets activities + revisions when include_revisions=true is passed',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities/?include_revisions=true&token=` +
        token, function(err, res, body) {
          expect(JSON.parse(body)).to.deep.include(withParentsData);
          expect(JSON.parse(body)).to.not.include(noParentsData);
          done();
        });
      });
    });

    // Tests that `include_revisions` includes revisions
    it('gets activities + revisions when include_revisions is passed',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities/?include_revisions&token=${token}`,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(withParentsData);
          expect(JSON.parse(body)).to.not.include(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just activities when include_revisions=false', function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities/?include_revisions=false&token=` +
        token, function(err, res, body) {
          expect(JSON.parse(body)).to.deep.include(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just activities when include_revisions is not set',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(`${baseUrl}activities/?token=${token}`,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(noParentsData);
          done();
        });
      });
    });
  });

  describe('GET /activities/:slug?include_revisions=true', function() {
    const currentTime = new Date().toISOString().substring(0, 10);
    const activity = 'docs';

    const noParentsData = {
      'name': 'Documentationification',
      'slug': 'docs',
      'uuid': '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
    };

    const withParentsData = {
      'name': 'Documentationification',
      'slug': 'docs',
      'uuid': '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      'revision': 2,
      'deleted_at': null,
      'updated_at': currentTime,
      'created_at': '2014-01-01',
      'parents': [
        {
          'name': 'Documentation',
          'slug': 'docs',
          'uuid': '986fe650-4bef-4e36-a99d-ad880b7f6cad',
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
              type: 'token',
            },
            object: obj,
          },
        };
      }

      const postActivity = {
        'name': 'Documentationification',
      };
      const postArg = getPostObject(baseUrl + 'activities/' + activity,
                      postActivity);

      getAPIToken().then(function(token) {
        postArg.body.auth.token = token;
        request.post(postArg, function() {
          done();
        });
      });
    });

    // Tests that include_revisions=true includes revisions
    it('gets activity + revisions when include_revisions=true is passed',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'activities/' + activity +
        '?include_revisions=true&token=' + token, function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(withParentsData);
          expect(JSON.parse(body)).to.deep.not.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets activity + revisions when include_revisions is passed',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'activities/' + activity +
        '?include_revisions&token=' + token, function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(withParentsData);
          expect(JSON.parse(body)).to.deep.not.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just activity when include_revisions=false', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'activities/' + activity +
        '?include_revisions=false&token=' + token, function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just activity when include_revisions is not set',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'activities/' + activity + '?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.include(noParentsData);
          done();
        });
      });
    });
  });

  describe('POST /activities', function() {
    // the activity object to attempt to add
    const activity = {
      slug: 'chef',
      name: 'Chef',
    };

    // the project as added to the database
    const newActivity = {
      slug: 'chef',
      name: 'Chef',
      created_at: new Date().toISOString().substring(0, 10),
      revision: 1,
    };

    const getActivity = {
      slug: 'chef',
      name: 'Chef',
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: null,
      deleted_at: null,
      revision: 1,
    };

    // the base POST JSON
    const postArg = {
      auth: {
        type: 'token',
      },
      object: activity,
    };

    const requestOptions = {
      url: baseUrl + 'activities/',
      json: true,
      method: 'POST',
    };

    function checkListEndpoint(done, expectedResults, token) {
      request.get(`${baseUrl}activities?token=${token}`,
      function(err, res, body) {
        expect(err).to.equal(null);
        expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
        expect(res.statusCode).to.equal(200);
        done();
      });
    }

    it('successfully creates a new activity by an admin', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedActivity = copyJsonObject(newActivity);
          addedActivity.uuid = body.uuid;
          expect(body).to.deep.equal(addedActivity);

          const expectedResult = copyJsonObject(getActivity);
          expectedResult.uuid = body.uuid;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('successfully creates a new activity by a manager', function(done) {
      getAPIToken('sManager', 'drowssap').then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedActivity = copyJsonObject(newActivity);
          addedActivity.uuid = body.uuid;
          expect(body).to.deep.equal(addedActivity);

          const expectedResult = copyJsonObject(getActivity);
          expectedResult.uuid = body.uuid;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('fails to create a new activity with bad authentication',
    function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Authentication failure',
            status: 401,
            text: 'Bad API token',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new activity by a regular user', function(done) {
      getAPIToken('sSpectator', 'word').then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Authorization failure',
            status: 401,
            text: 'sSpectator is not authorized to create activities',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new activity with an invalid slug', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        const slug = '*&$&^*@';
        requestOptions.body.object.slug = slug;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field slug of activity should be slug but was sent as ' +
                  'non-slug string',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new activity with an existing slug', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        const slug = 'dev';
        requestOptions.body.object.slug = slug;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'The slug provided already exists',
            status: 409,
            text: `slug ${slug} already exists`,
            values: [slug],
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new activity with no slug', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.slug = '';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The activity is missing a slug',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new activity with no name', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.name = '';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The activity is missing a name',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create a new activity with an existing name', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.name = 'Development';

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field name of activity should be unique name but was sent ' +
                  'as name which already exists',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create an activity with bad name datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.name = ['test'];

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field name of activity should be string but was sent as ' +
                  'array',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails to create an activity with bad slug datatype', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        requestOptions.body.object.slug = ['test'];

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field slug of activity should be string but was sent as ' +
                  'array',
          };
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });
  });

  describe('POST /activities/:slug', function() {
    const getOriginalActivity = {
      name: 'Documentation',
      slug: 'docs',
      uuid: '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      revision: 1,
      created_at: '2014-01-01',
      updated_at: null,
      deleted_at: null,
    };

    // A completely patched version of the above activity
    // Only contains valid patch elements
    const updatedAt = new Date().toISOString().substring(0, 10);
    const postPatchedActivity = {
      name: 'Project With Activity Documentation',
      slug: 'dev-docs',
    };

    const getPatchedActivity = {
      name: 'Project With Activity Documentation',
      slug: 'dev-docs',
      uuid: '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      revision: 2,
      created_at: '2014-01-01',
      updated_at: updatedAt,
      deleted_at: null,
    };

    const invalidActivityDataType = {
      name: {thisIs: 'the wrong data type'},
      slug: {thisIs: 'the wrong data type'},
    };

    const invalidActivityValue = {
      slug: 'activity--!@#$',
    };

    // Base POST JSON
    const postArg = {
      auth: {
        type: 'token',
      },
    };

    const requestOptions = {
      url: `${baseUrl}activities/docs`,
      json: true,
    };

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
            expect(body).to.deep.equal(postBodies[0]);
          }

          // Always checks for valid get request
          // err is always 'null'
          // res.statusCode is always 200
          // body always equals expectedresults
          let slug = 'docs';
          if (postObj.slug && !error) {
            slug = postObj.slug;
          }
          request.get(`${baseUrl}activities/${slug}?token=${token}`,
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

    it('successfully updates the activity by an admin', function(done) {
      const postObj = copyJsonObject(postPatchedActivity);
      const expectedResults = copyJsonObject(getPatchedActivity);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully updates the activity by a manager', function(done) {
      const postObj = copyJsonObject(postPatchedActivity);
      const expectedResults = copyJsonObject(getPatchedActivity);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, undefined, 'sManager', 'drowssap');
    });

    it('successfully updates the activity name', function(done) {
      const postObj = {name: postPatchedActivity.name};
      const expectedResults = copyJsonObject(getOriginalActivity);
      expectedResults.name = postPatchedActivity.name;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('successfully updates the activity slug', function(done) {
      const postObj = {slug: postPatchedActivity.slug};
      const expectedResults = copyJsonObject(getOriginalActivity);
      expectedResults.slug = postPatchedActivity.slug;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('fails to update a non-existent activity', function(done) {
      const uri = baseUrl + 'activities/not-an-activity';
      const postObj = {name: postPatchedActivity.name};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent activity',
      };

      checkPostToEndpoint(done, uri, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Returns an error 400 - errorBadObjectInvalidField
    it('fails to update an activity to have no name', function(done) {
      const postObj = {name: ''};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field name of activity should be string but was sent as ' +
              'empty string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it('fails to update an activity to have no slug', function(done) {
      const postObj = {slug: ''};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slug of activity should be slug but was sent as ' +
              'empty string',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it('fails to update an activity to have an existent name', function(done) {
      const postObj = {name: 'Development'};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field name of activity should be unique name but was sent ' +
              'as name which already exists',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it('fails to update an activity to have an existent slug', function(done) {
      const postObj = {slug: 'dev'};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 409,
        error: 'The slug provided already exists',
        text: 'slug dev already exists',
        values: ['dev'],
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it('fails to update activity if name is invalid type', function(done) {
      const postObj = {name: invalidActivityDataType.name};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field name of activity should be string but was sent as ' +
              'object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it('fails to update activity if slug is invalid type', function(done) {
      const postObj = {slug: invalidActivityDataType.slug};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slug of activity should be string but was sent as ' +
              'object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    it('fails to update an activity from regular user', function(done) {
      const postObj = {name: 'Development'};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 401,
        error: 'Authorization failure',
        text: 'sSpectator is not authorized to update activities',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error], 'sSpectator', 'word');
    });

    it('fails to update when given an invalid slug', function(done) {
      const slug = invalidActivityValue.slug;
      const postObj = {slug: slug};
      const expectedResults = copyJsonObject(getOriginalActivity);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field slug of activity should be valid slug but was sent ' +
              `as invalid slug ${slug}`,
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });
  });

  describe('DELETE /activities/:slug', function() {
    it('deletes the activity with the given slug', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'meeting';
        request.del(`${baseUrl}activities/${slug}?token=${token}`,
        function(delErr, delRes) {
          expect(delErr).to.equal(null);
          expect(delRes.statusCode).to.equal(200);

          // Checks to see that the activity has been deleted from the db
          request.get(`${baseUrl}activities/${slug}?token=${token}`,
          function(getErr, getRes, body) {
            const expectedError = {
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent activity',
            };

            expect(JSON.parse(body)).to.deep.equal(expectedError);
            expect(getRes.statusCode).to.equal(expectedError.status);

            done();
          });
        });
      });
    });

    it('fails if it receives a nonexistent slug', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'naps';
        request.del(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent slug',
          };

          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}activities?token=${token}`,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);

            done();
          });
        });
      });
    });

    it('fails if it receives an invalid slug', function(done) {
      getAPIToken().then(function(token) {
        const slug = '!what';
        request.del(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 400,
            error: 'The provided identifier was invalid',
            text: `Expected slug but received ${slug}`,
            values: [slug],
          };

          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}activities?token=${token}`,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);

            done();
          });
        });
      });
    });

    it('fails if the activity is referenced by a time', function(done) {
      getAPIToken().then(function(token) {
        const slug = 'docs';
        request.del(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 405,
            error: 'Method not allowed',
            text: 'The method specified is not allowed for the activity ' +
                  'identified',
          };

          expect(res.headers.allow).to.equal('GET, POST');
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}activities/${slug}?token=${token}`,
          function(getErr, getRes, getBody) {
            const expectedResult = initialData.filter(a => {
              return a.slug === slug;
            })[0];

            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal(expectedResult);
            expect(getRes.statusCode).to.equal(200);

            request.get(`${baseUrl}activities?token=${token}`,
            function(getErr0, getRes0, getBody0) {
              expect(getErr0).to.equal(null);
              expect(getRes0.statusCode).to.equal(200);
              expect(JSON.parse(getBody0)).to.deep.have.same
                                                          .members(initialData);
              done();
            });
          });
        });
      });
    });

    it('fails with invalid permissions', function(done) {
      getAPIToken('sSpectator', 'word').then(function(token) {
        const slug = 'meeting';
        request.del(`${baseUrl}activities/${slug}?token=${token}`,
        function(err, res, body) {
          const expectedError = {
            status: 401,
            error: 'Authorization failure',
            text: 'sSpectator is not authorized to delete activities',
          };

          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(expectedError.status);

          request.get(`${baseUrl}activities/${slug}?token=${token}`,
          function(getErr, getRes, getBody) {
            const expectedResult = initialData.filter(a => {
              return a.slug === slug;
            })[0];

            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal(expectedResult);
            expect(getRes.statusCode).to.equal(200);

            request.get(`${baseUrl}activities?token=${token}`,
            function(getErr0, getRes0, getBody0) {
              expect(getErr0).to.equal(null);
              expect(JSON.parse(getBody0)).to.deep.have.same
                                                      .members(initialData);
              expect(getRes0.statusCode).to.equal(200);

              done();
            });
          });
        });
      });
    });
  });
};
