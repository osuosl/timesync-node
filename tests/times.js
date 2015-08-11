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

    describe('POST /times/:id', function() {
        // The database's entry for `Whats Fresh`'s time entry
        var originalTime = {
            duration:    12,
            user:        'tschuy',
            project:     ['wf'],
            notes:       '',
            activities:  ['docs', 'dev'],
            // jscs:disable
            issue_uri:
               'https:://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: null,
            created_at:  null,
            updated_at:  null,
            // jscs:enable
            id:          1
        };

        // A completely patched version of the above time entry
        // Only contains valid patch elements.
        var patchedTime = {
            duration:    15,
            user:        'deanj',
            project:     ['pgd'],
            activities:  ['docs', 'sys'],
            notes:       'Now this is a note',
            // jscs:disable
            issue_uri:   'https://github.com/osuosl/pgd/pull/19',
            date_worked: '2015-04-28',
            // jscs:enable
        };

        // Individual pieces of the above JSON object
        // Used for sending individual patches
        patchedTimeDuration   = {duration:    patchedTime.duration};
        patchedTimeUser       = {user:        patchedTime.user};
        patchedTimeProject    = {project:     patchedTime.project};
        patchedTimeActivities = {activities:  patchedTime.activities};
        patchedTimeNotes      = {notes:       patchedTime.notes};
        // jscs:disable
        patchedTimeIssueUri   = {issue_uri:   patchedTime.issue_uri};
        patchedTimeDateWorked = {date_worked: patchedTime.date_worked};
        // jscs:enable

        // Sends invalid data to the /times/:id endpoint
        var invalidTime = {
            duration:    {thisIs: 'the wrong datatype'},
            user:        {thisIs: 'the wrong datatype'},
            project:     {thisIs: 'the wrong datatype'},
            activities:  {thisIs: 'the wrong datatype'},
            notes:       {thisIs: 'the wrong datatype'},
            // jscs:disable
            issue_uri:   {thisIs: 'the wrong datatype'},
            date_worked: {thisIs: 'the wrong datatype'},
            // jscs:enable
            key: 'this is a string',
        };

        // Individual pieces of the above JSON object
        // Used for sending individual patches
        invalidTimeDuration   = {duration:    invalidTime.duration};
        invalidTimeUser       = {user:        invalidTime.user};
        invalidTimeProject    = {project:     invalidTime.project};
        invalidTimeActivities = {activities:  invalidTime.activities};
        invalidTimeNotes      = {notes:       invalidTime.notes};
        // jscs:disable
        invalidTimeIssueUri   = {issue_uri:   invalidTime.issue_uri};
        invalidTimeDateWorked = {date_worked: invalidTime.date_worked};
        // jscs:enable
        invalidTimeKey        = {key:         invalidTime.key};

        var postArg = {
            auth: {
                user: 'tschuy',
                password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                          'PvSG8rwN4xyaF5W'
            },
        };

        var requestOptions = {
            url: baseUrl + 'times/1',
            json: true
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
        function sendDataToEndpoint(done,
                                    postObj,
                                    expectedResults,
                                    error,
                                    statusCode,
                                    postBodies) {
            postArg.object = copyJsonObject(postObj);
            requestOptions.form = copyJsonObject(postArg);

            // make a given post request
            // check the error
            // check the statusCode
            // Also check the body of the request
            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a(error);
                expect(res.statusCode).to.equal(statusCode);

                if (postBody !== undefined) {
                    expect(postBodies).to.include.members(body);
                    console.log(postBodies);
                }

                // Always checks for valid get request
                // err is always 'null'
                // res.statusCode is always 200
                // body always equals expectedresults
                request.get(requestOptions.url, function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);
                    console.log(body);
                    expect(body).to.deep.equal(expectedResults);
                    done();
                });
            });
        }

        // Tests all valid fields
        it('succesfully patches time with valid duration, user, project,' +
           ' activity notes, issue_uri, and date_worked', function(done) {
            postObj = copyJsonObject(patchedTime);
            expectedResults = copyJsonObject(patchedTime);
            expectedResults.id = originalTime.id;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid duration field
        it('successfully patches time with valid duration', function(done) {
            postObj = copyJsonObject(patchedTimeDuration);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.duration = patchedTime.duration;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid user field
        // This test's functionality will be implemented at a later date
        // (after the rest of the /time/:id functionality is implemented)
        it('successfully patches time with valid user', function(done) {
            postObj = copyJsonObject(patchedTimeUser);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.user = patchedTime.user;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid project field
        it('successfully patches time with valid project', function(done) {
            postObj = copyJsonObject(patchedTimeProject);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.project = patchedTime.project;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid activities field
        it('successfully patches time with valid activities', function(done) {
            postObj = copyJsonObject(patchedTimeActivities);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.activities = patchedTime.activities;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid notes field
        it('successfully patches time with valid notes', function(done) {
            postObj = copyJsonObject(patchedTimeNotes);
            expectedResults = copyJsonObject(originalTime);
            expectedResults.notes = patchedTime.notes;
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid issue_uri field
        it('successfully patches time with valid issue_uri', function(done) {
            postObj = copyJsonObject(patchedTimeIssueUri);
            expectedResults = copyJsonObject(originalTime);
            // jscs:disable
            expectedResults.issue_uri = patchedTime.issue_uri;
            // jscs:enable
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests valid date_worked field
        it('successfully patches time with valid date_worked', function(done) {
            postObj = copyJsonObject(patchedTimeDateWorked);
            expectedResults = copyJsonObject(originalTime);
            // jscs:disable
            expectedResults.date_worked = patchedTime.date_worked;
            // jscs:enable
            error = 'null';
            statusCode = 200;
            postBody = undefined;

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all invalid fields
        it('unsuccesfully patches time with invalid duration, user, project,' +
           ' activity notes, issue_uri, and date_worked', function(done) {
            postObj = copyJsonObject(invalidTime);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field duration of time should be ' +
                        'string but was sent as object'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field user of time should be ' +
                        'string but was sent as object'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field project of time should be ' +
                        'string but was sent as object'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field activities of time should be ' +
                        'array but was sent as object'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field notes of time should be ' +
                        'string but was sent as object'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field issue_uri of time should be ' +
                        'string but was sent as object'
            },
            {
                status: 400,
                error: 'Bad object',
                text: 'Field date_worked of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid duration field
        it('unsuccessfully patches time with just invalid duration',
           function(done) {
            postObj = copyJsonObject(invalidTimeDuration);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field duration of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid user field
        // This test's functionality will be implemented at a later date
        // (after the rest of the /time/:id functionality is implemented)
        it('unsuccessfully patches time with just invalid user',
           function(done) {
            postObj = copyJsonObject(invalidTimeUser);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field user of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid project field
        it('unsuccessfully patches time with just invalid project',
           function(done) {
            postObj = copyJsonObject(invalidTimeProject);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field project of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid activities field
        it('unsuccessfully patches time with just invalid activites',
           function(done) {
            postObj = copyJsonObject(invalidTimeActivities);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field activities of time should be ' +
                        'array but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid notes field
        it('unsuccessfully patches time with just invalid notes',
           function(done) {
            postObj = copyJsonObject(invalidTimeNotes);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field notes of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid issue_uri field
        it('unsuccessfully patches time with just invalid issue_uri',
           function(done) {
            postObj = copyJsonObject(invalidTimeIssueUri);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field issue_uri of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid date_worked field
        it('unsuccessfully patches time with just invalid date_worked',
           function(done) {
            postObj = copyJsonObject(invalidTimeDateWorked);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field date_worked of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests invalid key field
        it('unsuccessfully patches time with just invalid key',
           function(done) {
            postObj = copyJsonObject(invalidTimeKey);
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'time does not have a key field',
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid duration
        it('unsuccessfully patches time with an invalid duration',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.duration = invalidTime.duration;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field duration of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid user
        // This test's functionality will be implemented at a later date
        // (after the rest of the /time/:id functionality is implemented)
        it('unsuccessfully patches time with an invalid user',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.user = invalidTime.user;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field user of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid project
        it('unsuccessfully patches time with an invalid project',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.project = invalidTime.project;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field project of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid activities
        it('unsuccessfully patches time with an invalid activities',
           function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.activities = invalidTime.activities;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field activities of time should be ' +
                        'array but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid notes
        it('unsuccessfully patches time with an invalid notes',
            function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.notes = invalidTime.notes;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field notes of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid issue_uri
        it('unsuccessfully patches time with an invalid issue_uri',
            function(done) {
            postObj = copyJsonObject(originalTime);
            // jscs:disable
            postObj.issue_uri = invalidTime.issue_uri;
            // jscs:enable
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field issue_uri of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid date_worked
        it('unsuccessfully patches time with an invalid date_worked',
            function(done) {
            postObj = copyJsonObject(originalTime);
            // jscs:disable
            postObj.date_worked = invalidTime.date_worked;
            // jscs:enable
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'Field date_worked of time should be ' +
                        'string but was sent as object'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });

        // Tests all valid fields except invalid key
        it('unsuccessfully patches time with an invalid key',
            function(done) {
            postObj = copyJsonObject(originalTime);
            postObj.key = invalidTime.key;
            expectedResults = copyJsonObject(originalTime);
            error = 'Bad Object';
            statusCode = 400;
            postBody = [
            {
                status: 400,
                error: 'Bad object',
                text: 'time does not have a key field'
            }];

            sendDataToEndpoint(done, postObj, expectedResults, error,
                               statusCode, postBody);
        });
    });
};
