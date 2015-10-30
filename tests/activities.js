'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without affecting other tests
  return JSON.parse(JSON.stringify(obj));
}

module.exports = function(expect, request, baseUrl) {
  /* GET one of the /activities endpoints and check its response against
  what should be returned */
  describe('GET /activities', function() {
    it('should return all activities in the database', function(done) {
      request.get(baseUrl + 'activities', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResults = [
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
        ];

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });
  });

  describe('GET /activities/:slug', function() {
    it('should return activities by slug', function(done) {
      request.get(baseUrl + 'activities/sys', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          name: 'Systems',
          slug: 'sys',
          deleted_at: null,
          updated_at: null,
          created_at: '2014-01-01',
          uuid: '504796fd-859d-4edd-b2b8-b4109bb1fdf2',
          revision: 1,
        };

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('should fail with object not found error', function(done) {
      request.get(baseUrl + 'activities/404', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent activity',
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(404);

        done();
      });
    });

    it('should fail with Invalid Slug error', function(done) {
      request.get(baseUrl + 'activities/test-!*@', function(err, res, body) {
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

  describe('DELETE /activities/:slug', function() {
    it('deletes the activity with the given slug', function(done) {
      request.del(baseUrl + 'activities/meeting', function(delErr, delRes) {
        expect(delErr).to.be.a('null');
        expect(delRes.statusCode).to.equal(200);

        // Checks to see that the activity has been deleted from the db
        request.get(baseUrl + 'activities/meeting',
        function(getErr, getRes, body) {
          const jsonBody = JSON.parse(body);
          const expectedError = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent activity',
          };

          expect(jsonBody).to.deep.equal(expectedError);
          expect(getRes.statusCode).to.equal(404);

          done();
        });
      });
    });

    it('fails if it receives a nonexistent slug', function(done) {
      request.del(baseUrl + 'activities/naps', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedError = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent slug',
        };

        expect(jsonBody).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(404);

        request.get(baseUrl + 'activities', function(getErr, getRes, getBody) {
          const jsBody = JSON.parse(getBody);
          const expectedResult = [
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
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(jsBody).to.deep.have.same.members(expectedResult);

          done();
        });
      });
    });

    it('fails if it receives an invalid slug', function(done) {
      request.del(baseUrl + 'activities/!what', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedError = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected slug but received !what',
          values: ['!what'],
        };

        expect(jsonBody).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'activities', function(getErr, getRes, getBody) {
          const jsBody = JSON.parse(getBody);
          const expectedResult = [
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
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(jsBody).to.deep.have.same.members(expectedResult);

          done();
        });
      });
    });

    it('fails if the activity is referenced by a time', function(done) {
      request.del(baseUrl + 'activities/docs', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedError = {
          status: 405,
          error: 'Method not allowed',
          text: 'The method specified is not allowed for the ' +
          'activity identified',
        };

        expect(res.headers.allow).to.equal('GET, POST');
        expect(jsonBody).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(405);

        request.get(baseUrl + 'activities', function(getErr, getRes, getBody) {
          const jsBody = JSON.parse(getBody);
          const expectedResult = [
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
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(jsBody).to.deep.have.same.members(expectedResult);

          done();
        });
      });
    });
  });

  describe('GET /activities?include_deleted=:bool', function() {
    it('returns a list of all active and deleted activities', function(done) {
      request.get(baseUrl + 'activities?include_deleted=true',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
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

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });

    // Refer to API Docs: Bad Query Value - The activityslug parameter is
    // ignored, but since 'include_deleted=true', return the list of activities
    it('ignores extra param if user specifies query with an activityslug',
    function(done) {
      request.get(baseUrl +
      'activities?activity=review&include_deleted=true',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
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

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.equal(expectedResults);
        done();
      });
    });

    it('returns an error if user specifies with /activities/:slug endpoint',
    function(done) {
      request.get(baseUrl + 'activities/review?include_deleted=true',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent activity',
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(getRes.statusCode).to.equal(404);
        done();
      });
    });
  });

  describe('POST /activities/:slug', function() {
    const patchedActivity = {
      name: 'TimeSync Documentation',
      slug: 'dev-docs',
    };

    const originalActivity = {
      name: 'Documentation',
      slug: 'docs',
      deleted_at: null,
      updated_at: null,
      created_at: '2014-01-01',
      uuid: '986fe650-4bef-4e36-a99d-ad880b7f6cad',
      revision: 1,
    };

    const patchedName = { name: patchedActivity.name };

    const patchedSlug = { slug: patchedActivity.slug };

    const badActivity = {
      name: '',
      slug: '',
    };

    const badPatchedName = { name: badActivity.name };

    const badPatchedSlug = { slug: badActivity.slug };

    // Base POST JSON
    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
        type: 'password',
      },
    };

    const requestOptions = {
      url: baseUrl + 'activities/docs',
      json: true,
    };

    // Performs get request to check whether the db's been changed
    function checkGetReq(done) {
      request.get(baseUrl + 'activities/docs',
      function(getErr, getRes, getBody) {
        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);

        const jsonBody = JSON.parse(getBody);

        expect(jsonBody).to.deep.equal(originalActivity);

        done();
      });
    }

    it('successfully updates the activity', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = patchedActivity;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const expectedResult = copyJsonObject(originalActivity);
        expectedResult.name = patchedActivity.name;
        expectedResult.slug = patchedActivity.slug;
        expectedResult.revision = 2;
        expectedResult.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResult);
        delete expectedPost.deleted_at;

        expect(body).to.deep.equal(expectedPost);

        // Checking that the activity has been properly updated
        request.get(baseUrl + 'activities/dev-docs',
        function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);

          expect(jsonBody).to.deep.equal(expectedResult);

          done();
        });
      });
    });

    it('successfully updates the activity name', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = patchedName;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const expectedResult = copyJsonObject(originalActivity);
        expectedResult.name = patchedName.name;
        expectedResult.revision = 2;
        expectedResult.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResult);
        delete expectedPost.deleted_at;

        expect(body).to.deep.equal(expectedPost);

        request.get(baseUrl + 'activities/docs',
        function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);

          expect(jsonBody).to.deep.equal(expectedResult);

          done();
        });
      });
    });

    it('successfully updates the activity slug', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = patchedSlug;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        const expectedResult = copyJsonObject(originalActivity);
        expectedResult.slug = patchedSlug.slug;
        expectedResult.revision = 2;
        expectedResult.updated_at = new Date().toISOString().substring(0, 10);

        const expectedPost = copyJsonObject(expectedResult);
        delete expectedPost.deleted_at;

        expect(body).to.deep.equal(expectedPost);

        request.get(baseUrl + 'activities/dev-docs',
        function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);

          expect(jsonBody).to.deep.equal(expectedResult);

          done();
        });
      });
    });

    // Returns an error 400 - errorBadObjectInvalidRield
    it('fails to update an activity to have no name', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = badPatchedName;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field name of activity should be string but was sent as ' +
                'empty string',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkGetReq(done);
      });
    });

    it('fails to update an activity to have no slug', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = badPatchedSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field slug of activity should be slug but was sent as ' +
                'empty string',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkGetReq(done);
      });
    });

    it('fails to update activity if name is invalid type', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = copyJsonObject(patchedActivity);
      requestOptions.body.object.name = ['timesync', 'documentation'];

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field name of activity should be string but was sent as ' +
                'array',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkGetReq(done);
      });
    });

    it('fails to update activity if slug is invalid type', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = copyJsonObject(patchedActivity);
      requestOptions.body.object.slug = ['docs', 'api'];

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field slug of activity should be string but was sent as ' +
                'array',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkGetReq(done);
      });
    });

    it('fails to update an activity with bad authentication', function(done) {
      requestOptions.body = copyJsonObject(postArg);
      requestOptions.body.object = copyJsonObject(patchedActivity);
      requestOptions.body.auth.password = 'drowssap';

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 401,
          error: 'Authentication failure',
          text: 'Incorrect password.',
        };

        expect(body).deep.equal(expectedError);
        expect(res.statusCode).to.equal(401);

        checkGetReq(done);
      });
    });

    it('fails to update when given a nonexistent slug', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = copyJsonObject(patchedActivity);
      requestOptions.url = baseUrl + 'activities/doge';

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent activity',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(404);

        checkGetReq(done);
      });
    });

    it('fails to update when given an invalid slug', function(done) {
      requestOptions.body = postArg;
      requestOptions.body.object = copyJsonObject(patchedActivity);
      requestOptions.url = baseUrl + 'activities/!._cucco';

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected slug but received !._cucco',
          values: ['!._cucco'],
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkGetReq(done);
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

    // the base POST JSON
    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
        type: 'password',
      },
      object: activity,
    };

    const initialActivities = [
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
    ];

    const requestOptions = {
      url: baseUrl + 'activities/',
      json: true,
      method: 'POST',
    };

    function checkListEndpoint(done, newActivityItem) {
      request.get(baseUrl + 'activities', function(getErr, getRes, getBody) {
        // the projects/ endpoint should now have one more project
        let expectedGetResults;
        if (newActivityItem) {
          expectedGetResults = initialActivities.concat([
            {
              slug: 'chef',
              name: 'Chef',
              deleted_at: null,
              updated_at: null,
              created_at: new Date().toISOString().substring(0, 10),
              uuid: newActivityItem.uuid,
              revision: 1,
            },
          ]);
        } else {
          expectedGetResults = initialActivities;
        }

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);

        expect(JSON.parse(getBody))
        .to.have.same.deep.members(expectedGetResults);
        done();
      });
    }

    it('successfully creates a new activity', function(done) {
      requestOptions.form = postArg;

      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        // Hacky workaround because UUIDs are random
        newActivity.uuid = body.uuid;
        expect(body).to.deep.equal(newActivity);

        checkListEndpoint(done, newActivity);
      });
    });

    it('fails to create a new activity with bad auth', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object = copyJsonObject(newActivity);
      requestOptions.form.auth.password = 'not correct password';

      request.post(requestOptions, function(err, res, body) {
        expect(res.statusCode).to.equal(401);

        expect(body.error).to.equal('Authentication failure');
        expect(body.text).to.equal('Incorrect password.');

        checkListEndpoint(done);
      });
    });

    it('fails to create a new activity with an invalid slug', function(done) {
      const postInvalidSlug = copyJsonObject(postArg);
      postInvalidSlug.object.slug = '$*#*cat';
      requestOptions.form = postInvalidSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'Field slug of activity should be slug but was sent as ' +
          'non-slug string',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkListEndpoint(done);
      });
    });

    it('fails to create a new activity with an existing slug', function(done) {
      const postExistingSlug = copyJsonObject(postArg);
      postExistingSlug.object.slug = 'dev';
      requestOptions.form = postExistingSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 409,
          error: 'The slug provided already exists',
          text: 'slug dev already exists',
          values: ['dev'],
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(409);

        checkListEndpoint(done);
      });
    });

    it('fails to create a new activity with no slug', function(done) {
      const postNoSlug = copyJsonObject(postArg);
      delete postNoSlug.object.slug;
      requestOptions.form = postNoSlug;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'The activity is missing a slug',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkListEndpoint(done);
      });
    });

    it('fails to create a new activity with no name', function(done) {
      const postNoName = copyJsonObject(postArg);
      delete postNoName.object.name;
      requestOptions.form = postNoName;

      request.post(requestOptions, function(err, res, body) {
        const expectedError = {
          status: 400,
          error: 'Bad object',
          text: 'The activity is missing a name',
        };

        expect(body).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);

        checkListEndpoint(done);
      });
    });

    it('fails to create an activity with bad name datatype', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object.name = ['test'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field name of' +
        ' activity should be string but was sent as array');

        checkListEndpoint(done);
      });
    });

    it('fails to create an activity with bad slug datatype', function(done) {
      requestOptions.form = copyJsonObject(postArg);
      requestOptions.form.object.slug = ['test'];

      request.post(requestOptions, function(err, res, body) {
        expect(body.error).to.equal('Bad object');
        expect(res.statusCode).to.equal(400);
        expect(body.text).to.equal('Field slug of' +
        ' activity should be string but was sent as array');

        checkListEndpoint(done);
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
              type: 'password',
              username: 'tschuy',
              password: 'password',
            },
            object: obj,
          },
        };
      }

      const activity = 'docs';
      const postActivity = {
        'name': 'Documentationification',
      };
      const postArg = getPostObject(baseUrl + 'activities/' + activity,
                      postActivity);

      request.post(postArg, function() {
        done();
      });
    });

    // Tests that `include_revisions=true` includes revisions
    it('gets activities + revisions when include_revisions=true is passed',
    function(done) {
      request.get(baseUrl + 'activities/?include_revisions=true',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(withParentsData);
        expect(JSON.parse(body)).to.not.include(noParentsData);
        done();
      });
    });

    // Tests that `include_revisions` includes revisions
    it('gets activities + revisions when include_revisions is passed',
    function(done) {
      request.get(baseUrl + 'activities/?include_revisions',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(withParentsData);
        expect(JSON.parse(body)).to.not.include(noParentsData);
        done();
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just activities when include_revisions=false', function(done) {
      request.get(baseUrl + 'activities/?include_revisions=false',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(noParentsData);
        done();
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just activities when include_revisions is not set',
    function(done) {
      request.get(baseUrl + 'activities/',
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(noParentsData);
        done();
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
              type: 'password',
              username: 'tschuy',
              password: 'password',
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

      request.post(postArg, function() {
        done();
      });
    });

    // Tests that include_revisions=true includes revisions
    it('gets activity + revisions when include_revisions=true is passed',
    function(done) {
      request.get(baseUrl + 'activities/' + activity +
      '?include_revisions=true', function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(withParentsData);
        expect(JSON.parse(body)).to.deep.not.equal(noParentsData);
        done();
      });
    });

    // Tests that include_revisions includes revisions
    it('gets activity + revisions when include_revisions is passed',
    function(done) {
      request.get(baseUrl + 'activities/' + activity + '?include_revisions',
      function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(withParentsData);
        expect(JSON.parse(body)).to.deep.not.equal(noParentsData);
        done();
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just activity when include_revisions=false', function(done) {
      request.get(baseUrl + 'activities/' + activity +
      '?include_revisions=false', function(err, res, body) {
        expect(JSON.parse(body)).to.include(noParentsData);
        done();
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just activity when include_revisions is not set',
    function(done) {
      request.get(baseUrl + 'activities/' + activity,
      function(err, res, body) {
        expect(JSON.parse(body)).to.include(noParentsData);
        done();
      });
    });
  });
};
