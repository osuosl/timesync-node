'use strict';

module.exports = function(expect, request, baseUrl) {
  /* GET one of the /times endpoints and check its response against
  what should be returned */
  describe('GET /times', function() {
    it('returns all times in the database', function(done) {
      request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
          {
            duration: 12,
            user: 'patcht',
            project: ['pgd'],
            activities: ['dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-22',
            created_at: '2015-04-22',
            updated_at: null,
            id: 4,
          },
        ];

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(JSON.parse(getBody)).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user', function() {
    it('returns all times for a user', function(done) {
      request.get(baseUrl + 'times?user=deanj', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a non-existent user', function(done) {
      request.get(baseUrl + 'times?user=fakeuser', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter user contained invalid value "fakeuser"',
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?project=:project', function() {
    it('returns all times for a project', function(done) {
      request.get(baseUrl + 'times?project=gwm', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a non-existent project', function(done) {
      request.get(baseUrl + 'times?project=notreal', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter project contained invalid value "notreal"',
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity', function() {
    it('returns all times for an activity', function(done) {
      request.get(baseUrl + 'times?activity=docs', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a non-existent activity', function(done) {
      request.get(baseUrl + 'times?activity=falsch', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter activity contained invalid value "falsch"',
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?start=:start', function() {
    it('returns all times after a date', function(done) {
      request.get(baseUrl + 'times?start=2015-04-20',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
          {
            duration: 12,
            user: 'patcht',
            project: ['pgd'],
            activities: ['dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-22',
            created_at: '2015-04-22',
            updated_at: null,
            id: 4,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for an invalid start date', function(done) {
      request.get(baseUrl + 'times?start=faux', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter start contained invalid value "faux"',
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a future start date', function(done) {
      request.get(baseUrl + 'times?user=2105-04-19', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter start contained invalid value "2015-04-19"',
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?end=:end', function() {
    it('returns all times before a date', function(done) {
      request.get(baseUrl + 'times?end=2015-04-21',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for an invalid end date', function(done) {
      request.get(baseUrl + 'times?end=namaak', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter end contained invalid value "namaak"',
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?start=:start&end=:end', function() {
    it('returns all times between two dates', function(done) {
      request.get(baseUrl + 'times?start=2015-04-20' +
      '&end=2015-04-21', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a start date after an end date', function(done) {
      request.get(baseUrl + 'times?start=2015-04-21&end=2015-04-19', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(400);

        expect(jsonBody.status).to.equal(400);
        expect(jsonBody.error).to.equal('Bad Query Value');

        expect([
          'Parameter end contained invalid value "2015-04-19"',
          'Parameter start contained invalid value "2015-04-21"',
        ]).to.include.members(jsonBody.text);
        done();
      });
    });
  });

  describe('GET /times?user=:user1&user=:user2', function() {
    it('returns all times for two users', function(done) {
      request.get(baseUrl + 'times?user=deanj&user=patcht',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
          {
            duration: 12,
            user: 'patcht',
            project: ['pgd'],
            activities: ['dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-22',
            created_at: '2015-04-22',
            updated_at: null,
            id: 4,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&project=:project', function() {
    it('returns all times for a user and a project', function(done) {
      request.get(baseUrl + 'times?user=deanj&project=gwm',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&activity=:activity', function() {
    it('returns all times for a user and an activity',
    function(done) {
      request.get(baseUrl + 'times?user=deanj&activity=docs',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&start=:start', function() {
    it('returns all times for a user after a date', function(done) {
      request.get(baseUrl + 'times?user=deanj&start=2015-04-20',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['pgd'],
            activities: ['sys'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-21',
            created_at: '2015-04-21',
            updated_at: null,
            id: 3,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&end=:end', function() {
    it('returns all times for a user before a date', function(done) {
      request.get(baseUrl + 'times?user=tschuy&end=2015-04-21',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&start=:start&end=:end', function() {
    it('returns all times for a user between two dates',
    function(done) {
      request.get(baseUrl + 'times?user=deanj&start=2015-04-19' +
      '&end=2015-04-20', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?project=:project1&project=:project2', function() {
    it('returns all times for two projects', function(done) {
      request.get(baseUrl + 'times?project=gwm&project=wf',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?project=:project&activity=:activity', function() {
    it('returns all times for a project and an activity',
    function(done) {
      request.get(baseUrl + 'times?project=gwm&activity=dev',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?project=:project&start=:start', function() {
    it('returns all times for a project after a date',
    function(done) {
      request.get(baseUrl + 'times?project=gwm&start=2015-04-20',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?project=:project&end=:end', function() {
    it('returns all times for a project before a date',
    function(done) {
      request.get(baseUrl + 'times?project=gwm&end=2015-04-20',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?project=:project&start=:start&end=:end',
  function() {
    it('returns all times for a project between two dates',
    function(done) {
      request.get(baseUrl + 'times?project=gwm&start=2015-04-19' +
      '&end=2015-04-21', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity1&activity=:activity2', function() {
    it('returns all times for two activities', function(done) {
      request.get(baseUrl + 'times?activity=docs&activity=dev',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
          {
            duration: 12,
            user: 'patcht',
            project: ['pgd'],
            activities: ['dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-22',
            created_at: '2015-04-22',
            updated_at: null,
            id: 4,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&start=:start', function() {
    it('returns all times for an activity after a date',
    function(done) {
      request.get(baseUrl + 'times?activity=dev&start=2015-04-20',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'patcht',
            project: ['pgd'],
            activities: ['dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-22',
            created_at: '2015-04-22',
            updated_at: null,
            id: 4,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&end=:end', function() {
    it('returns all times for an activity before a date',
    function(done) {
      request.get(baseUrl + 'times?activity=dev&end=2015-04-21',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&start=:start&end=:end',
  function() {
    it('returns all times for an activity between two dates',
    function(done) {
      request.get(baseUrl + 'times?activity=dev&start=2015-04-19' +
      '&end=2015-04-21', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&project=:project&activity=:activity&' +
  'start=:start&end=:end', function() {
    it('returns all times for a user, project, and activity ' +
    'between two dates', function(done) {
      request.get(baseUrl + 'times?user=tschuy&project=pgd&' +
      'activity=docs' + '&start=2015-04-20&end=2015-04-22',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user1&user=:user2&project=:project&' +
  'activity=:activity&start=:start&end=:end', function() {
    it('returns all times for two users, a project, and activity ' +
    'between two dates', function(done) {
      request.get(baseUrl + 'times?user=deanj&user=tschuy&project=gwm&' +
      'activity=dev&start=2015-04-19&end=2015-04-21',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
          {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
            id: 2,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&project=:project1&project=:project2&' +
  'activity=:activity&start=:start&end=:end', function() {
    it('returns all times for a user, two projects, and an ' +
    'activity between two dates', function(done) {
      request.get(baseUrl + 'times?user=deanj&project=gwm&project=pgd&' +
      'activity=docs&start=2015-04-19&end=2015-04-20',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user&project=:project&activity=:activity1&' +
  'activity=:activity2&start=:start&end=:end', function() {
    it('returns all times for a user, project, and two activities ' +
    'between two dates', function(done) {
      request.get(baseUrl + 'times?user=deanj&project=gwm&' +
      'activity=docs&activity=dev&start=2015-04-19&' +
      'end=2015-04-20', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResults = [
          {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'],
            activities: ['docs', 'dev'],
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            id: 1,
          },
        ];

        expect(jsonBody).to.have.length(expectedResults.length);
        for (let i = 0, len = jsonBody.length; i < len; i++) {
          expectedResults[i].project.sort();
          expectedResults[i].activities.sort();
          jsonBody[i].project.sort();
          jsonBody[i].activities.sort();
        }

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times/:id', function() {
    it('returns times by id', function(done) {
      request.get(baseUrl + 'times/1', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          duration: 12,
          user: 'deanj',
          project: ['gwm', 'ganeti-webmgr'],
          activities: ['docs', 'dev'],
          notes: '',
          issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
          date_worked: '2015-04-19',
          created_at: '2015-04-19',
          updated_at: null,
          id: 1,
        };

        expect(getErr).to.equal(null);
        expect(getRes.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('should fail with Object not found error', function(done) {
      request.get(baseUrl + 'times/404', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          error: 'Object not found',
          status: 404,
          text: 'Nonexistent time',
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(getRes.statusCode).to.equal(404);

        done();
      });
    });

    it('fails with Invalid Identifier error', function(done) {
      request.get(baseUrl + 'times/cat', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          error: 'The provided identifier was invalid',
          status: 400,
          text: 'Expected ID but received cat',
          values: ['cat'],
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(getRes.statusCode).to.equal(400);

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
        user: 'deanj',
        project: ['gwm', 'ganeti-webmgr'],
        activities: ['docs', 'dev'],
        notes: '',
        issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-19',
        created_at: '2015-04-19',
        updated_at: null,
        id: 1,
      },
      {
        duration: 12,
        user: 'tschuy',
        project: ['gwm', 'ganeti-webmgr'],
        activities: ['docs'],
        notes: '',
        issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: null,
        id: 2,
      },
      {
        duration: 12,
        user: 'deanj',
        project: ['pgd'],
        activities: ['sys'],
        notes: '',
        issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-21',
        created_at: '2015-04-21',
        updated_at: null,
        id: 3,
      },
      {
        duration: 12,
        user: 'patcht',
        project: ['pgd'],
        activities: ['dev'],
        notes: '',
        issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-22',
        created_at: '2015-04-22',
        updated_at: null,
        id: 4,
      },
    ];

    it('creates a new time with activities', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        expect(postErr).to.equal(null);
        expect(postRes.statusCode).to.equal(200);

        time.id = postBody.id;
        expect(postBody).to.deep.equal(time);

        const createdAt = new Date().toISOString().substring(0, 10);
        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          const expectedResults = initialData.concat([
            {
              duration: 20,
              user: 'tschuy',
              project: ['pgd'],
              activities: ['dev', 'docs'],
              notes: '',
              issue_uri: 'https://github.com/osuosl/pgd/issues/1',
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              id: 5,
            },
          ]);
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(expectedResults);
          done();
        });
      });
    });

    it('fails with a bad password', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);
      postArg.body.auth.password = 'not the real password';

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Incorrect password.',
        };

        expect(postRes.statusCode).to.equal(401);
        expect(postBody).to.deep.equal(expectedResult);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.deep.equal(null);
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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);
      delete postArg.body.auth;

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Missing credentials',
        };

        expect(postRes.statusCode).to.equal(401);
        expect(postBody).to.deep.equal(expectedResult);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field duration of time should be positive number ' +
          'but was sent as negative number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field duration of time should be number but was sent as string',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a duration',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs', 'activity_!@#'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be slugs but was sent as ' +
          'array containing at least 1 invalid slug',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs', 'dancing'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Invalid foreign key',
          status: 409,
          text: 'The time does not contain a valid activities reference.',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(409);

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
        project: 'pgd',
        activities: ['dev', 'docs', -14],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be slugs but was sent as ' +
          'array containing at least 1 number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: 1.414141414,
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be array but was sent as number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a activities',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field project of time should be slug but was sent as invalid ' +
          'slug project? we need a project?',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Invalid foreign key',
          status: 409,
          text: 'The time does not contain a valid project reference.',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(409);

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
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field project of time should be string but was sent as array',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a project',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'I do my own thing, pal',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field issue_uri of time should be URI but was sent as ' +
          'invalid URI I do my own thing, pal',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 3.14159265,
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field issue_uri of time should be string but was sent as number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        expect(postErr).to.equal(null);
        expect(postRes.statusCode).to.equal(200);

        time.id = postBody.id;
        expect(postBody).to.deep.equal(time);

        const createdAt = new Date().toISOString().substring(0, 10);
        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          const expectedResults = initialData.concat([
            {
              duration: 20,
              user: 'tschuy',
              project: ['pgd'],
              activities: ['dev', 'docs'],
              notes: '',
              issue_uri: null,
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              id: 5,
            },
          ]);
          expect(getErr).to.equal(null);
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(expectedResults);
          done();
        });
      });
    });

    it('fails with a bad user', function(done) {
      const time = {
        duration: 20,
        user: 'jenkinsl',
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authorization failure',
          status: 401,
          text: 'tschuy is not authorized to create time entries for jenkinsl',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(401);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field user of time should be string but ' +
          'was sent as object',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a user',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: 'baaaaaaaad',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field date_worked of time should be ISO-8601 date ' +
          'but was sent as baaaaaaaad',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
        date_worked: 1234,
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field date_worked of time should be string ' +
          'but was sent as number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
        project: 'pgd',
        activities: ['dev', 'docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/pgd/issues/1',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a date_worked',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

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
