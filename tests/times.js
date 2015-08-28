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
            id: 1,
          },
        ];

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times/:id', function() {
    it('returns times by id', function(done) {
      request.get(baseUrl + 'times/1', function(err, res, body) {
        const jsonBody = JSON.parse(body);
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
              activities: ['dev', 'docs'],
              notes: '',
              issue_uri: 'https://github.com/osuosl/gwm/issues/1',
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              id: 2,
            },
          ]);
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);
          const jsonGetBody = JSON.parse(getBody);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
              activities: ['dev', 'docs'],
              notes: '',
              issue_uri: null,
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              id: 2,
            },
          ]);
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);
          const jsonGetBody = JSON.parse(getBody);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
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
          expect(JSON.parse(getBody)).to.deep.equal(initialData);
          done();
        });
      });
    });
  });
};
