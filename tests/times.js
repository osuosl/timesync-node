'use strict';

module.exports = function(expect, request, baseUrl) {
  /* GET one of the /times endpoints and check its response against
  what should be returned */
  describe('GET /times', function() {
    it('returns all times in the database', function(done) {
      request.get(baseUrl + 'times', function(err, res, body) {
        const expectedResults = [
          {
            duration: 12,
            user: 'tschuy',
            project: ['wf'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass' +
            '/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            deleted_at: null,
            parent: null,
            id: 1,
          },
        ];

        // chopping off the end of the date
        const jsonBody = JSON.parse(body);
        jsonBody[0].created_at = jsonBody[0].created_at.slice(0, 10);
        jsonBody[0].date_worked = jsonBody[0].date_worked.slice(0, 10);

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times/:id', function() {
    it('returns times by id', function(done) {
      request.get(baseUrl + 'times/1', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        jsonBody.created_at = jsonBody.created_at.slice(0, 10);
        jsonBody.date_worked = jsonBody.date_worked.slice(0, 10);

        const expectedResult = {
          duration: 12,
          user: 'tschuy',
          project: ['wf'],
          activities: ['docs', 'dev'],
          notes: '',
          issue_uri: 'https://github.com/osu-cass/whats-fresh-api' +
          '/issues/56',
          date_worked: '2015-04-19',
          created_at: '2015-04-19',
          updated_at: null,
          deleted_at: null,
          parent: null,
          id: 1,
        };

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails with Object not found error', function(done) {
      request.get(baseUrl + 'times/404', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          error: 'Object not found',
          status: 404,
          text: 'Nonexistent time',
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(404);

        done();
      });
    });

    it('fails with Invalid Identifier error', function(done) {
      request.get(baseUrl + 'times/cat', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          error: 'The provided identifier was invalid',
          status: 400,
          text: 'Expected ID but received cat',
          values: ['cat'],
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        done();
      });
    });
  });

  describe('POST /times', function() {
    function getPostObject(uri, time) {
      return {
        uri: uri,
        json: true,
        body: {
          auth: {
            type: 'password',
            username: 'tschuy',
            password: 'password',
          },
          object: time,
        },
      };
    }

    const initialData = [
      {
        duration: 12,
        user: 'tschuy',
        project: ['wf'],
        activities: ['docs', 'dev'],
        notes: '',
        issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-19',
        created_at: '2015-04-19',
        updated_at: null,
        deleted_at: null,
        parent: null,
        id: 1,
      },
    ];

    it('creates a new time with activities', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);
      request.post(postArg, function(err, res, body) {
        expect(err).to.equal(null);

        time.id = body.id;

        expect(body).to.deep.equal(time);

        const createdAt = new Date().toISOString().substring(0, 10);
        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          const expectedResults = initialData.concat([
            {
              duration: 20,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'],
              activities: ['docs', 'dev'],
              notes: '',
              issue_uri: 'https://github.com/osuosl/gwm/issues/1',
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              deleted_at: null,
              parent: null,
              id: 2,
            },
          ]);
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonGetBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonGetBody[i].created_at = jsonGetBody[i].created_at.slice(0, 10);
            jsonGetBody[i].date_worked = jsonGetBody[i].date_worked
                                                       .slice(0, 10);
          }

          expect(jsonGetBody).to.deep.have.same.members(expectedResults);
          done();
        });
      });
    });

    it('fails with a bad password', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);
      postArg.body.auth.password = 'not the real password';

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Incorrect password.',
        };

        expect(res.statusCode).to.equal(401);
        expect(body).to.deep.equal(expectedResult);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.deep.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it("fails when user isn't member of project", function(done) {
      const time = {
        duration: 20,
        user: 'thai',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);
      postArg.body.auth.password = 'passing';
      postArg.body.auth.username = 'thai';

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Authorization failure',
          status: 401,
          text: 'thai is not authorized to create time entries for project ' +
          'gwm.',
        };

        expect(res.statusCode).to.equal(401);
        expect(body).to.deep.equal(expectedResult);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a missing login', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);
      delete postArg.body.auth;

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Missing credentials',
        };

        expect(res.statusCode).to.equal(401);
        expect(body).to.deep.equal(expectedResult);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.deep.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a negative duration', function(done) {
      const time = {
        duration: -20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field duration of time should be positive number ' +
          'but was sent as negative number',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-numeric duration', function(done) {
      const time = {
        duration: 'twenty',
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field duration of time should be number but ' +
          'was sent as string',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a missing duration', function(done) {
      const time = {
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a duration',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a bad activity', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs', 'activity_!@#'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be slugs but was sent as ' +
          'array containing at least 1 invalid slug',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-existent activity', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs', 'dancing'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Invalid foreign key',
          status: 409,
          text: 'The time does not contain a valid activities reference.',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(409);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-string activity', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs', -14],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be slugs but was sent as ' +
          'array containing at least 1 number',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-array activities', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: 1.414141414,
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be array ' +
          'but was sent as number',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with missing activities', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a activities',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a bad project', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'project? we need a project?',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field project of time should be slug but was sent as ' +
          'invalid slug project? we need a project?',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-existent project', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'project-xyz',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Invalid foreign key',
          status: 409,
          text: 'The time does not contain a valid project reference.',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(409);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-string project', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: ['Who needs', 'proper types?'],
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field project of time should be string but was sent as array',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a missing project', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a project',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a bad issue URI', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'I do my own thing, pal',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field issue_uri of time should be URI but was sent as ' +
          'invalid URI I do my own thing, pal',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-string issue URI', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 3.14159265,
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field issue_uri of time should be string but was sent ' +
          'as number',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('works with a missing issue URI', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        time.id = body.id;
        expect(body).to.deep.equal(time);

        const createdAt = new Date().toISOString().substring(0, 10);
        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          const expectedResults = initialData.concat([
            {
              duration: 20,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'],
              activities: ['docs', 'dev'],
              notes: '',
              issue_uri: null,
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              deleted_at: null,
              parent: null,
              id: 2,
            },
          ]);
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonGetBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonGetBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonGetBody[i].created_at = jsonGetBody[i].created_at.slice(0, 10);
            jsonGetBody[i].date_worked = jsonGetBody[i].date_worked
                                                       .slice(0, 10);
          }

          expect(jsonGetBody).to.deep.have.same.members(expectedResults);
          done();
        });
      });
    });

    it('fails with a bad user', function(done) {
      const time = {
        duration: 20,
        user: 'jenkinsl',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Authorization failure',
          status: 401,
          text: 'tschuy is not authorized to create time entries for jenkinsl',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(401);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-string user', function(done) {
      const time = {
        duration: 20,
        user: {username: 'tschuy'},
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field user of time should be string but ' +
          'was sent as object',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a missing user', function(done) {
      const time = {
        duration: 20,
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a user',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a bad date worked', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: 'baaaaaaaad',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field date_worked of time should be ISO-8601 date ' +
          'but was sent as baaaaaaaad',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a non-string date worked', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: 1234,
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field date_worked of time should be string ' +
          'but was sent as number',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });

    it('fails with a missing date worked', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(err, res, body) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a date_worked',
        };

        expect(body).to.deep.equal(expectedResult);
        expect(res.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);

          const jsonBody = JSON.parse(getBody);
          /* eslint-disable prefer-const */
          for (let i = 0, len = jsonBody.length; i < len; i++) {
          /* eslint-enable prefer-const */
            jsonBody[i].created_at = jsonBody[i].created_at.slice(0, 10);
            jsonBody[i].date_worked = jsonBody[i].date_worked.slice(0, 10);
          }

          expect(jsonBody).to.deep.equal(initialData);
          done();
        });
      });
    });
  });

  describe('POST /times/:id', function() {
    // The database's entry for `Whats Fresh`'s time entry
    const postOriginalTime = {
      duration: 12,
      user: 'tschuy',
      project: 'wf',
      notes: '',
      activities: ['docs', 'dev'],
      issue_uri:
         'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-19',
    };

    const getOriginalTime = {
      duration: 12,
      user: 'tschuy',
      project: 'wf',
      notes: '',
      activities: ['docs', 'dev'],
      issue_uri:
         'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-19',
      created_at: '2015-04-19',
      updated_at: null,
      deleted_at: null,
      parent: null,
      id: 1,
    };

    // A completely patched version of the above time entry
    // Only contains valid patch elements.
    const updatedAt = new Date().toISOString().substring(0, 10);
    const postPatchedTime = {
      duration: 15,
      user: 'deanj',
      project: 'pgd',
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/pgd/pull/19',
      date_worked: '2015-04-28',
    };

    const getPatchedTime = {
      duration: 15,
      user: 'deanj',
      project: 'pgd',
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/pgd/pull/19',
      date_worked: '2015-04-28',
      created_at: '2015-04-19',
      updated_at: updatedAt,
      deleted_at: null,
      parent: null,
    };

    // Sends invalid data to the /times/:id endpoint
    const invalidTimeDataType = {
      duration: {thisIs: 'the wrong datatype'},
      user: {thisIs: 'the wrong datatype'},
      project: {thisIs: 'the wrong datatype'},
      activities: {thisIs: 'the wrong datatype'},
      notes: {thisIs: 'the wrong datatype'},
      issue_uri: {thisIs: 'the wrong datatype'},
      date_worked: {thisIs: 'the wrong datatype'},
      key: 'this is a string',
    };

    // Sends invalid data to the /times/:id endpoint
    const invalidTimeValue = {
      duration: -1,
      user1: 'validusername',
      user2: 'invalid-us]ername',
      project1: 'valid-project-slug',
      project2: 'invalid_project_slug',
      activities1: ['valid-slug-one', 'valid-slug-two'],
      activities2: ['1_invalid_slug', '2_invalid_slug'],
      issue_uri: 'git@github.com:osuosl',
      date_worked: 'April 29, 1995',
    };

    const postArg = {
      auth: {
        username: 'tschuy',
        password: 'password',
      },
    };

    const requestOptions = {
      url: baseUrl + 'times/1',
      json: true,
    };

    function copyJsonObject(obj) {
      // This allows us to change object properties
      // without effecting other tests
      return JSON.parse(JSON.stringify(obj));
    }

    /*
     * Okay so here's the deal.
     * This endpoint has ~26 tests, which are honestly just 3 tests
     * repeated 7 or 8 times (with a few exceptions).
     * This function in theory gets rid of a lot of the repeated code in
     * the tests.
     * Without this function you would see this exact code pretty 26
     * times over.
     */
    function checkPostToEndpoint(done,
                  postObj,
                  expectedResults,
                  error,
                  statusCode,
                  postBodies) {
      postArg.object = postObj;
      requestOptions.form = postArg;

      // make a given post request
      // check the error
      // check the statusCode
      // Also check the body of the request
      request.post(requestOptions, function(err, res, body) {
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
        request.get(requestOptions.url, function(err0, res0, body0) {
          expect(body0.error).to.equal(undefined);
          expect(res0.statusCode).to.equal(200);

          const jsonBody0 = JSON.parse(body0);
          jsonBody0.created_at = jsonBody0.created_at.slice(0, 10);
          jsonBody0.date_worked = jsonBody0.date_worked.slice(0, 10);

          if (jsonBody0.updated_at !== null) {
            jsonBody0.updated_at = jsonBody0.updated_at.slice(0, 10);
          }

          expect(jsonBody0).to.deep.equal(expectedResults);
          done();
        });
      });
    }

    // Tests all valid fields
    it('succesfully patches time with valid duration, user, project,' +
    ' activity notes, issue_uri, and date_worked', function(done) {
      const postObj = copyJsonObject(postPatchedTime);
      const expectedResults = copyJsonObject(getPatchedTime);
      expectedResults.id = getOriginalTime.id;
      expectedResults.project = ['pgd'];
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode);
    });

    // Tests valid duration field
    it('successfully patches time with valid duration', function(done) {
      const postObj = {duration: postPatchedTime.duration};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.duration = postPatchedTime.duration;
      expectedResults.project = ['wf'];
      expectedResults.updated_at = updatedAt;
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode);
    });

    // Tests valid user field
    // This test's functionality will be implemented at a later date
    // (after the rest of the /time/:id functionality is implemented)
    it('successfully patches time with valid user', function(done) {
      const postObj = {user: postPatchedTime.user};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      expectedResults.updated_at = updatedAt;
      expectedResults.user = postPatchedTime.user;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid project field
    it('successfully patches time with valid project', function(done) {
      const postObj = {project: postPatchedTime.project};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['pgd'];
      expectedResults.updated_at = updatedAt;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid activities field
    it('successfully patches time with valid activities', function(done) {
      const postObj = {activities: postPatchedTime.activities};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      expectedResults.updated_at = updatedAt;
      expectedResults.activities = postPatchedTime.activities;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid notes field
    it('successfully patches time with valid notes', function(done) {
      const postObj = {notes: postPatchedTime.notes};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.notes = postPatchedTime.notes;
      expectedResults.project = ['wf'];
      expectedResults.updated_at = updatedAt;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid issue_uri field
    it('successfully patches time with valid issue_uri', function(done) {
      const postObj = {issue_uri: postPatchedTime.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.issue_uri = postPatchedTime.issue_uri;
      expectedResults.project = ['wf'];
      expectedResults.updated_at = updatedAt;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid date_worked field
    it('successfully patches time with valid date_worked', function(done) {
      const postObj = {date_worked: postPatchedTime.date_worked};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.date_worked = postPatchedTime.date_worked;
      expectedResults.project = ['wf'];
      expectedResults.updated_at = updatedAt;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests all invalid fields
    it('unsuccesfully patches time with invalid duration, user, project,' +
    ' activity notes, issue_uri, and date_worked dattype', function(done) {
      const postObj = copyJsonObject(invalidTimeDataType);
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field duration of time should be ' +
              'number but was sent as object',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field user of time should be ' +
              'string but was sent as object',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field project of time should be ' +
              'string but was sent as object',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field activities of time should be ' +
              'array but was sent as object',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field notes of time should be ' +
              'string but was sent as object',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field issue_uri of time should be ' +
              'string but was sent as object',
        },
        {
          status: 400,
          error: 'Bad object',
          text: 'Field date_worked of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid duration field
    it('unsuccessfully patches time with just invalid duration datatype',
    function(done) {
      const postObj = {duration: invalidTimeDataType.duration};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field duration of time should be ' +
              'number but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid user field
    // This test's functionality will be implemented at a later date
    // (after the rest of the /time/:id functionality is implemented)
    it('unsuccessfully patches time with just invalid user datatype',
    function(done) {
      const postObj = {user: invalidTimeDataType.user};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field user of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid project field
    it('unsuccessfully patches time with just invalid project datatype',
    function(done) {
      const postObj = {project: invalidTimeDataType.project};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field project of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid activities field
    it('unsuccessfully patches time with just invalid activites datatype',
    function(done) {
      const postObj = {activities: invalidTimeDataType.activities};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field activities of time should be ' +
              'array but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid notes field
    it('unsuccessfully patches time with just invalid notes datatype',
    function(done) {
      const postObj = {notes: invalidTimeDataType.notes};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field notes of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid issue_uri field
    it('unsuccessfully patches time with just invalid issue_uri datatype',
    function(done) {
      const postObj = {issue_uri: invalidTimeDataType.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field issue_uri of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid date_worked field
    it('unsuccessfully patches time with just invalid date_worked datatype',
    function(done) {
      const postObj = {date_worked: invalidTimeDataType.date_worked};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field date_worked of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests invalid key field
    it('unsuccessfully patches time with just invalid key datatype',
    function(done) {
      const postObj = {key: invalidTimeDataType.key};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'time does not have a key field',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid duration
    it('unsuccessfully patches time with an invalid duration datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.duration = invalidTimeDataType.duration;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field duration of time should be ' +
              'number but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid user
    // This test's functionality will be implemented at a later date
    // (after the rest of the /time/:id functionality is implemented)
    it('unsuccessfully patches time with an invalid user datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.user = invalidTimeDataType.user;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field user of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid project
    it('unsuccessfully patches time with an invalid project datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.project = invalidTimeDataType.project;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field project of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid activities
    it('unsuccessfully patches time with an invalid activities datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.activities = invalidTimeDataType.activities;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field activities of time should be ' +
              'array but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid notes
    it('unsuccessfully patches time with an invalid notes datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.notes = invalidTimeDataType.notes;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field notes of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid issue_uri
    it('unsuccessfully patches time with an invalid issue_uri datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.issue_uri = invalidTimeDataType.issue_uri;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field issue_uri of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid date_worked
    it('unsuccessfully patches time with an invalid date_worked datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.date_worked = invalidTimeDataType.date_worked;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field date_worked of time should be ' +
              'string but was sent as object',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all valid fields except invalid key
    it('unsuccessfully patches time with an invalid key datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.key = invalidTimeDataType.key;
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'time does not have a key field',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // The following test a valid datatype being sent to /times/:id, but
    // the data being sent is incorrect, either a bad slug or some other
    // error.
    //
    // Test multiple bad identifiers at once

    // Test invalid duration identifier
    it('unsuccessfully patches time with just invalid duration identifier',
    function(done) {
      const postObj = {duration: invalidTimeValue.duration};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field duration of time should be positive integer but ' +
              'was sent as negative integer',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Test invalid user invalid foreign key
    it('unsuccessfully patches time with just invalid user foreign key',
    function(done) {
      const postObj = {user: invalidTimeValue.user1};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Invalid foreign key';
      const statusCode = 409;
      const postBody = [
        {
          status: 409,
          error: 'Invalid foreign key',
          text: 'The time does not contain a valid user reference.',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Test invalid user (invalid formatting)
    /*
    it('unsuccessfully patches time with just invalid user string',
       function(done) {
      const postObj = {user: invalidTimeValue.user2};
      const expectedResults = copyJsonObject(originalTime);
      expectedResults.project = ['wf'];
      let error = 'Bad object';
      const statusCode = 400;
      const postBody = [
      {
        status: 400,
        error: 'Bad object',
        text: 'Field user of time should be username but was sent ' +
            'as string.'
      }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });
    */

    // Test invalid project foreign key
    it('unsuccessfully patches time with just invalid project foreign key',
    function(done) {
      const postObj = {project: invalidTimeValue.project1};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Invalid foreign key';
      const statusCode = 409;
      const postBody = [
        {
          status: 409,
          error: 'Invalid foreign key',
          text: 'The time does not contain a valid project reference.',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Test invalid project (inavlid formatting)
    it('unsuccessfully patches time with just invalid project string',
    function(done) {
      const postObj = {project: invalidTimeValue.project2};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Invalid foreign key';
      const statusCode = 409;
      const postBody = [
        {
          status: 409,
          error: 'Invalid foreign key',
          text: 'The time does not contain a valid project reference.',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Test invalid activities (not in the database)
    /*
    it('unsuccessfully patches time with just invalid activities foreign ' +
       'key', function(done) {
      const postObj = {activities: invalidTimeValue.activities1};
      const expectedResults = copyJsonObject(originalTime);
      expectedResults.project = ['wf'];
      let error = 'Invalid foreign key';
      const statusCode = 409;
      const postBody = [
      {
        status: 409,
        error: 'Bad object',
        text: 'The time does not contain a valid activities reference'
      }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });
    */

    // Test invalid activities (invalid formatting)
    /*
    it('unsuccessfully patches time with just invalid activities string',
       function(done) {
      const postObj = {user: invalidTimeValue.activities2};
      const expectedResults = copyJsonObject(originalTime);
      expectedResults.project = ['wf'];
      let error = 'Bad object';
      const statusCode = 400;
      const postBody = [
      {
        status: 400,
        error: 'Bad object',
        text: 'Field activites of time should be array of activities ' +
            'but was sent as array of strings.'
      }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });
    */

    // Test bad issue uri (formatting)
    it('unsuccessfully patches time with just invalid issue_uri',
    function(done) {
      const postObj = {issue_uri: invalidTimeValue.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.project = ['wf'];
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field issue_uri of time should be URI but was sent ' +
              'as invalid URI git@github.com:osuosl',
        },
      ];

      checkPostToEndpoint(done, postObj, expectedResults, error,
              statusCode, postBody);
    });

    // Test bad date (formatting)
    /*
    it('unsuccessfully patches time with just invalid date_worked',
       function(done) {
      const postObj = {date_worked: invalidTimeValue.date_worked};
      const expectedResults = copyJsonObject(originalTime);
      expectedResults.project = ['wf'];
      let error = 'Bad object';
      const statusCode = 400;
      const postBody = [
      {
        status: 400,
        error: 'Bad object',
        text: 'Field date_worked of time should be date but was ' +
            'sent as string.'
      }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });
    */
  });
};
