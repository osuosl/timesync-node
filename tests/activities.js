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
            parent: null,
            id: 1,
            delete_at: null,
            parent: null,
          },
          {
            name: 'Development',
            slug: 'dev',
            deleted_at: null,
            updated_at: null,
            parent: null,
            id: 2,
            delete_at: null,
            parent: null,
          },
          {
            name: 'Systems',
            slug: 'sys',
            deleted_at: null,
            updated_at: null,
            parent: null,
            id: 3,
            delete_at: null,
            parent: null,
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
          parent: null,
          id: 3,
          delete_at: null,
          parent: null,
        };

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('should fail with invalid slug error', function(done) {
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
      request.del(baseUrl + 'activities/sys', function(delErr, delRes) {
        expect(delErr).to.be.a('null');
        expect(delRes.statusCode).to.equal(200);

        const expectedResponse = {
          name: 'Systems',
          slug: 'sys',
          id: 3,
          deleted_at: new Date().toISOString().substring(0, 10),
          parent: null,
        };

        // Checks to see that the activity has been 'deleted' from the db
        request.get(baseUrl + 'activities/sys', function(getErr, getRes, body) {
          const jsonBody = JSON.parse(body);
          const expectedError = {
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent activity',
          };

          expect(jsonBody).to.deep.equal(expectedError);
          expect(getRes.statusCode).to.equal(404);

          // Checks to see that the activity is still visible with the archive
          // parameter.
          request.get(baseUrl + 'activities/sys?archived=true',
          function(getErrArchive, getResArchive, bodyArchive) {
            const jsonBodyArchive  = JSON.parse(bodyArchive);

            expect(jsonBodyArchive).to.deep.equal(expectedResponse);
            expect(getResArchive.statusCode).to.equal(200);

            done();
          });
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
              parent: null,
              id: 1,
              deleted_at: null,
              parent: null,
            },
            {
              name: 'Development',
              slug: 'dev',
              deleted_at: null,
              updated_at: null,
              parent: null,
              id: 2,
              deleted_at: null,
              parent: null,
            },
            {
              name: 'Systems',
              slug: 'sys',
              deleted_at: null,
              updated_at: null,
              parent: null,
              id: 3,
              deleted_at: null,
              parent: null,
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
              parent: null,
              id: 1,
              deleted_at: null,
              parent: null,
            },
            {
              name: 'Development',
              slug: 'dev',
              deleted_at: null,
              updated_at: null,
              parent: null,
              id: 2,
              deleted_at: null,
              parent: null,
            },
            {
              name: 'Systems',
              slug: 'sys',
              deleted_at: null,
              updated_at: null,
              parent: null,
              id: 3,
              deleted_at: null,
              parent: null,
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
              parent: null,
              id: 1,
              deleted_at: null,
              parent: null,
            },
            {
              name: 'Development',
              slug: 'dev',
              deleted_at: null,
              updated_at: null,
              parent: null,
              id: 2,
              deleted_at: null,
              parent: null,
            },
            {
              name: 'Systems',
              slug: 'sys',
              deleted_at: null,
              updated_at: null,
              parent: null,
              id: 3,
              deleted_at: null,
              parent: null,
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

  describe('POST /activities/:slug', function() {
    const patchedActivity = {
      name: 'TimeSync Documentation',
      slug: 'dev-docs',
    };

    const originalActivity =  {
      name: 'Documentation',
      slug: 'docs',
      deleted_at: null,
      updated_at: null,
      parent: null,
      id: 1,
    };

    const responseActivity = {
      name: 'TimeSync Documentation',
      slug: 'dev-docs',
      id: 4,
      parent: 1,
      deleted_at: null,
    };

    const deletedActivity =  {
      name: 'Documentation',
      slug: 'docs',
      id: 1,
      parent: null,
      deleted_at: new Date().toISOString().substring(0, 10),
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
        expectedResult.name  = responseActivity.name;
        expectedResult.slug  = responseActivity.slug;
        expectedResult.id    = responseActivity.id;

        const expectedPost = copyJsonObject(expectedResult);
        delete expectedPost.deleted_at;
        delete expectedPost.updated_at;
        delete expectedPost.parent;

        expect(body).to.deep.equal(expectedPost);

        // Checking that the activity has been properly updated
        request.get(baseUrl + 'activities/dev-docs',
        function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          expect(jsonBody).to.deep.equal(expectedResult);

          // Make request to see old version of this object.
          request.get(baseUrl + 'activities/dev-docs?archived=true',
          function(getErrArchive, getResArchive, getBodyArchive) {
            expect(getErrArchive).to.be.a('null');
            expect(getResArchive.statusCode).to.equal(200);

            const jsonBodyArchive = JSON.parse(getBodyArchive);
            expect(jsonBodyArchive).to.contain(deletedActivity);

            done();
          });
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
        expectedResult.name  = responseActivity.name;
        expectedResult.id    = responseActivity.id;

        const expectedPost = copyJsonObject(expectedResult);
        delete expectedPost.deleted_at;
        delete expectedPost.updated_at;
        delete expectedPost.parent;

        expect(body).to.deep.equal(expectedPost);

        request.get(baseUrl + 'activities/docs',
        function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          expect(jsonBody).to.deep.equal(expectedResult);

          // Make request to see old version of this object.
          request.get(baseUrl + 'activities/dev-docs?archived=true',
          function(getErrArchive, getResArchive, getBodyArchive) {
            expect(getErrArchive).to.be.a('null');
            expect(getResArchive.statusCode).to.equal(200);

            const jsonBodyArchive = JSON.parse(getBodyArchive);
            expect(jsonBodyArchive).to.contain(deletedActivity);

            done();
          });
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
        expectedResult.slug  = responseActivity.slug;
        expectedResult.id    = responseActivity.id;

        const expectedPost = copyJsonObject(expectedResult);
        delete expectedPost.deleted_at;
        delete expectedPost.updated_at;
        delete expectedPost.parent;

        expect(body).to.deep.equal(expectedPost);

        request.get(baseUrl + 'activities/dev-docs',
        function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);

          expect(jsonBody).to.deep.equal(expectedResult);

          // Make request to see old version of this object.
          request.get(baseUrl + 'activities/dev-docs?archived=true',
          function(getErrArchive, getResArchive, getBodyArchive) {
            expect(getErrArchive).to.be.a('null');
            expect(getResArchive.statusCode).to.equal(200);

            const jsonBodyArchive = JSON.parse(getBodyArchive);
            expect(jsonBodyArchive).to.contain(deletedActivity);

            done();
          });
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
      delete requestOptions.body.object.id;
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
      delete requestOptions.body.object.id;
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
      id: 4,
      deleted_at: null,
      parent: null,
    };

    // the base POST JSON
    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
      },
      object: activity,
    };

    const initialActivities = [
      {
        'name': 'Documentation',
        'slug': 'docs',
        'deleted_at': null,
        'updated_at': null,
        'parent': null,
        'id': 1,
      },
      {
        'name': 'Development',
        'slug': 'dev',
        'deleted_at': null,
        'updated_at': null,
        'parent': null,
        'id': 2,
      },
      {
        'name': 'Systems',
        'slug': 'sys',
        'deleted_at': null,
        'updated_at': null,
        'parent': null,
        'id': 3,
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
              parent: null,
              id: 4,
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
};
