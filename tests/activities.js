'use strict';

function copyJsonObject(obj) {
    // This allows us to change object properties
    // without effecting other tests
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
            id: 1,
          },
          {
            name: 'Development',
            slug: 'dev',
            id: 2,
          },
          {
            name: 'Systems',
            slug: 'sys',
            id: 3,
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
          id: 3,
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

        // Checks to see that the activity has been deleted from the db
        request.get(baseUrl + 'activities/sys', function(getErr, getRes, body) {
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
              id: 1,
            },
            {
              name: 'Development',
              slug: 'dev',
              id: 2,
            },
            {
              name: 'Systems',
              slug: 'sys',
              id: 3,
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
              id: 1,
            },
            {
              name: 'Development',
              slug: 'dev',
              id: 2,
            },
            {
              name: 'Systems',
              slug: 'sys',
              id: 3,
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
              id: 1,
            },
            {
              name: 'Development',
              slug: 'dev',
              id: 2,
            },
            {
              name: 'Systems',
              slug: 'sys',
              id: 3,
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
        /* Things to test for:
            * Did the user pass a valid slug - Does this endpt exist?
            * The user wants to change the name, check that they're passing a
              valid string
            * The user wants to change the slugs, check that they're passing
              valid slugs
            * What if the user wants to make a massive update and change ALL
              the fields?

         * After making a post request with the changes...
            * Were the changes stored in the db?
            * Were they added correctly (not overwriting things you don't want
              to overwrite, right?)
            * Compare the post response to the get response
            * Twice
            * Check out pull 97 for a rough basis on how to maybe do things */

        // Attempt at patching
        var patchedActivity = {
            name:'TimeSync Documentation',
            slug:'dev-docs'
        };

        // Control that the updated activity is being compared to
        var originalActivity =  {
            name:'Documentation',
            slug:'docs',
            id: 1
        };

        // Assigning the fields of patchedActivity to variables
        var patchedName = {
            name: patchedActivity.name,
            slug: originalActivity.slug
        };

        var patchedSlug = {
            name: originalActivity.name,
            slug: patchedActivity.slug
        };

        // Bad object
        var badActivity = {
            name: '',
            slug: ''
        };

        var badPatchedName = {
            name: badActivity.name,
            slug: originalActivity.slug
        };

        var badPatchedSlug = {
            name: originalActivity.name,
            slug: badActivity.slug
        };

        // Base POST JSON
        var postArg = {
            auth: {
                username: 'tschuy',
                password: 'password'
            },
        };

        var requestOptions = {
            url: baseUrl + 'activities/docs',
            json: true
        };

        // Performs get request to check whether the db's been changed
        function checkGetReq(done) {
            request.get(baseUrl + 'activities/docs', function(err, res, body) {
                console.log('1');
                expect(err).to.be.a('null');
                console.log('2');
                expect(res.statusCode).to.equal(200);
                console.log('3');

                var jsonBody = JSON.parse(body);

                expect(jsonBody).to.deep.equal(originalActivity);
                console.log('4');
                done();
            });
        }

        it('successfully updates the activity', function(done) {
            requestOptions.body = postArg;
            requestOptions.body.object = copyJsonObject(patchedActivity);

            //console.log(requestOptions);
            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResult = copyJsonObject(originalActivity);
                expectedResult.name = patchedActivity.name;
                expectedResult.slug = patchedActivity.slug;
                
                expect(body).to.deep.equal(patchedActivity);

                // Checking that the activity has been properly updated
                request.get(baseUrl + 'activities/dev-docs',
                function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    var jsonBody = JSON.parse(body);

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

                var expectedResult = copyJsonObject(originalActivity);
                expectedResult.name = patchedName.name;

                expect(body).to.deep.equal(patchedName);

                request.get(baseUrl + 'activities/docs',
                function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    var jsonBody = JSON.parse(body);
                    
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

                var expectedResult = copyJsonObject(originalActivity);
                expectedResult.slug = patchedSlug.slug;

                expect(body).to.deep.equal(patchedSlug);

                request.get(baseUrl + 'activities/dev-docs',
                function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    var jsonBody = JSON.parse(body);
                    
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
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'Field name of activity should be a string but was' +
                          ' received as empty string'
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
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'Field slug of activity should be a slug but was' +
                          ' received as empty string'
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                checkGetReq(done);
            });
        });

        // Complete patch of activity object with invalid name field
        /*it('fails to update activity if name is invalid type', function(done) {
            requestOptions.body = postArg;
            requestOptions.body.object = copyJsonObject(originalActivity);
            delete requestOptions.body.object.id;
            requestOptions.body.object.name = ['timesync', 'documentation'];

            request.post(requestOptions, function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'Field name of activity should be string but was' +
                          ' received as list'
                };

                expect(jsonBody).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                checkGetReq(done);
            });
        });

        it('fails to update activity if slug is invalid type', function(done) {
            requestOptions.body = postArg;
            requestOptions.body.object = copyJsonObject(originalActivity);
            delete requestOptions.body.object.id;
            requestOptions.body.object.slug = ['docs', 'api'];
            
            console.log(requestOptions);
            console.log(requestOptions.body.object.slug);

            request.post(requestOptions, function(err, res, body) {
                console.log('a');
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'Field slug of activity should be slug but was ' +
                      'received as list'
                };

                console.log(res.body);
                console.log('b');
                expect(body).to.deep.equal(expectedError);
                console.log('c');
                expect(res.statusCode).to.equal(400);
                console.log('d');

                checkGetReq(done);
            });
        });*/

        // Complete patch of activity object with invalid slug field
        /*it('fails to update activity if slug is invalid', function(done) {
            requestOptions.body = postArg;
            requestOptions.body.object = copyJsonObject(originalActivity);
            delete requestOptions.body.object.id;
            requestOptions.body.object.slug = ['!@A12it'];

            request.post(requestOptions, function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'Field slug of activity should be slug but was ' +
                          'received as non-slug string'
                };

                expect(jsonBody).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                checkGetReq(done);
            });
        });*/

        /*it('fails to update activity if both fields are invalid',
        function(done) {
            requestOptions.body = postArg;
            requestOptions.body.object = copyJsonObject(badActivity);

            request.post(requestOptions, function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'Field name and slug of activity should be string ' +
                          'but was received as empty string'
                };

                expect(jsonBody).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                request.get(requestOptions.url, function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    var jsBody = JSON.parse(body);
                    expect(jsBody).to.deep.equal(originalActivity);
                    done();
                });
            });
        });

        it('fails to update an activity with bad authentication',
        function(done) {
            requestOptions.body = copyJsonObject(postArg);
            requestOptions.body.object = copyJsonObject(patchedActivity);
            requestOptions.body.auth.password = 'drowssap';

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 401,
                    error: 'Authentication failure',
                    text: 'strategyFailure'
                };
                expect(body).deep.equal(expectedError);
                expect(res.statusCode).to.equal(401);

                checkGetReq(done);
            });
        });*/

        it('fails to update when given a nonexistent slug', function(done) {
            requestOptions.body = postArg;
            requestOptions.body.object = copyJsonObject(patchedActivity);
            requestOptions.url = baseUrl + 'activities/doge';

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent activity'
                };
                // Checking that the post attempt fails
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
                var expectedError = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: 'Expected slug but received !._cucco',
                    values: ['!._cucco']
                };
                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                checkGetReq(done);
            });
        });
    });

};
