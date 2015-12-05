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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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
            deleted_at: null,
            revision: 1,
            uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
            id: 4,
          },
        ];

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(JSON.parse(getBody)).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?user=:user', function() {
    it('returns all times for a user', function(done) {
      request.get(baseUrl + 'times?user=deanj',
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a non-existent user', function(done) {
      request.get(baseUrl + 'times?user=fakeuser',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter user contained invalid value fakeuser',
        };

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?project=:project', function() {
    it('returns all times for a project', function(done) {
      request.get(baseUrl + 'times?project=gwm',
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a non-existent project', function(done) {
      request.get(baseUrl + 'times?project=notreal',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter project contained invalid value notreal',
        };

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity', function() {
    it('returns all times for an activity', function(done) {
      request.get(baseUrl + 'times?activity=docs',
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a non-existent activity', function(done) {
      request.get(baseUrl + 'times?activity=falsch',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter activity contained invalid value falsch',
        };

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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
            deleted_at: null,
            revision: 1,
            uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for an invalid start date', function(done) {
      request.get(baseUrl + 'times?start=faux',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter start contained invalid value faux',
        };

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('returns an error for a future start date', function(done) {
      request.get(baseUrl + 'times?start=2105-04-19',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter start contained invalid value 2105-04-19',
        };

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for an invalid end date', function(done) {
      request.get(baseUrl + 'times?end=namaak',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter end contained invalid value namaak',
        };

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });

    it('returns an error for a start date after an end date', function(done) {
      request.get(baseUrl + 'times?start=2015-04-21&end=2015-04-19',
      function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(400);

        expect(jsonBody.status).to.equal(400);
        expect(jsonBody.error).to.equal('Bad Query Value');

        expect([
          'Parameter end contained invalid value 2015-04-19',
          'Parameter start contained invalid value 2015-04-21',
        ]).to.include.members([jsonBody.text]);
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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
            deleted_at: null,
            revision: 1,
            uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            revision: 1,
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
            deleted_at: null,
            revision: 1,
            uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
      request.get(baseUrl + 'times?user=tschuy&project=gwm&' +
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
      'activity=docs&start=2015-04-19&end=2015-04-21',
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
            deleted_at: null,
            revision: 1,
            uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
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
            deleted_at: null,
            revision: 1,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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

        expect(getErr).to.be.a('null');
        expect(getRes.statusCode).to.equal(200);
        expect(jsonBody).to.deep.have.same.members(expectedResults);
        done();
      });
    });
  });

  describe('GET /times?include_deleted=true', function() {
    const softDeletedTimes = [
      {
        duration: 12,
        user: 'tschuy',
        project: ['gwm', 'ganeti-webmgr'],
        activities: ['docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: null,
        id: 5,
        uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
        revision: 1,
        deleted_at: '2015-07-04',
      },
      {
        duration: 12,
        user: 'patcht',
        project: ['pgd'],
        activities: ['dev'],
        notes: '',
        issue_uri: '',
        date_worked: '2015-04-22',
        created_at: '2015-04-22',
        updated_at: null,
        id: 6,
        uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
        revision: 1,
        deleted_at: '2015-08-12',
      },
    ];

    it('returns a list of all active and deleted times', function(done) {
      request.get(baseUrl + 'times?include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes[0]);
        expect(jsonBody).to.include(softDeletedTimes[1]);
        done();
      });
    });
  });

  describe('GET /times?user=:user&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all active and deleted times for the specified user when ' +
    'include_deleted=true', function(done) {
      request.get(baseUrl + 'times?user=tschuy&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });

    it('fails if given a nonexistent user',
    function(done) {
      request.get(baseUrl + 'times?user=notauser&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter user contained invalid value notauser',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails when given an invalid user', function(done) {
      request.get(baseUrl + 'times?user=wh4t3v3n.isTh%s&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter user contained invalid value wh4t3v3n.isTh%s',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all active and deleted times for the specified activity ' +
    'when include_deleted=true', function(done) {
      request.get(baseUrl + 'times?activity=dev&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });

    it('fails when given a nonexistent activity',
    function(done) {
      request.get(baseUrl + 'times?activity=review&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter activity contained invalid value review',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails if given an invalid activity', function(done) {
      request.get(baseUrl + 'times?activity=w_hA.t&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter activity contained invalid value w_hA.t',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?project=:project?include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all active and deleted times for the specified project ' +
    'when include_deleted=true', function(done) {
      request.get(baseUrl + 'times?project=pgd&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });

    it('fails when given a nonexistent project', function(done) {
      request.get(baseUrl + 'times?project=chili&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter project contained invalid value chili',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails when given an invalid project', function(done) {
      request.get(baseUrl + 'times?project=not@slug!&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter project contained invalid value not@slug!',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?start=:start&included_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all active and deleted times after the specified start date',
    function(done) {
      request.get(baseUrl + 'times?start=2015-04-22&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });

    it('fails when given an invalid start date', function(done) {
      request.get(baseUrl + 'times?start=notaday&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter start contained invalid value notaday',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails when given a future start date', function(done) {
      request.get(baseUrl + 'times?start=3015-04-22&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter start contained invalid value 3015-04-22',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all active/deleted times before the specified date',
    function(done) {
      request.get(baseUrl + 'times?end=2015-04-20&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });

    it('fails if given an invalid end date', function(done) {
      request.get(baseUrl + 'times?end=theend&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 400,
          error: 'Bad Query Value',
          text: 'Parameter end contained invalid value theend',
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });
  });

  describe('GET /times?user=:user&activity=:activity&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given user and activity',
    function(done) {
      request.get(baseUrl +
      'times?user=tschuy&activity=docs&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&project=project&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given user and project',
    function(done) {
      request.get(baseUrl +
                  'times?user=patcht&project=pgd&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&start:=start&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a user after a start date', function(done) {
      request.get(baseUrl + 'times?user=tschuy&start=2015-04-20&' +
      'include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&end=:end&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for a user after a end date', function(done) {
      request.get(baseUrl + 'times?user=patcht&end=2015-04-22&' +
      'include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&activitiy=:activity&project=:project&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given parameters', function(done) {
      request.get(baseUrl + 'times?user=patcht&activity=dev&project=pgd&' +
      'include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&activitiy=:activity&project=:project&' +
  'start=:start&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given parameters', function(done) {
      request.get(baseUrl + 'times?user=patcht&activity=dev&project=pgd&' +
      '&start=2015-04-22&include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&activitiy=:activity&project=:project&' +
  'end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given parameters', function(done) {
      request.get(baseUrl + 'times?user=tschuy&activity=docs&project=gwm&' +
      'end=2015-04-22&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?user=:user&activitiy=:activity&project=:project&' +
  'start=:start&end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a user that match the given parameters',
    function(done) {
      request.get(baseUrl + 'times?user=tschuy&activity=docs&project=gwm&' +
      '&start=2015-04-19&end=2015-04-22&include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&project=:project&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given activity and project',
    function(done) {
      request.get(baseUrl + 'times?activity=docs&project=gwm&' +
      'include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&project=:project&start=:start&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['gwm', 'ganeti-webmgr'],
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      id: 5,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given activity and project',
    function(done) {
      request.get(baseUrl + 'times?activity=docs&project=gwm&' +
      'start=2015-04-17&include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&project=:project&start=:start&' +
  'end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given parameters', function(done) {
      request.get(baseUrl + 'times?activity=dev&project=pgd&start=2015-04-21&' +
      'end=2015-04-25&include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times?activity=:activity&project=:project&end=:end&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'patcht',
      project: ['pgd'],
      activities: ['dev'],
      notes: '',
      issue_uri: '',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      id: 6,
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given activity and project',
    function(done) {
      request.get(baseUrl + 'times?activity=dev&project=pgd&' +
      'end=2015-04-25&include_deleted=true', function(err, res, body) {
        const jsonBody = JSON.parse(body);
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.include(softDeletedTimes);
        done();
      });
    });
  });

  describe('GET /times/:uuid', function() {
    it('returns times by uuid', function(done) {
      request.get(baseUrl + 'times/32764929-1bea-4a17-8c8a-22d7fb144941',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
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
          deleted_at: null,
          uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
          revision: 1,
          id: 1,
        };

        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails with Object not found error', function(done) {
      request.get(baseUrl + 'times/00000000-0000-0000-0000-000000000000',
      function(err, res, body) {
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
      request.get(baseUrl + 'times/cat', function(getErr, getRes, getBody) {
        const jsonBody = JSON.parse(getBody);
        const expectedResult = {
          error: 'The provided identifier was invalid',
          status: 400,
          text: 'Expected UUID but received cat',
          values: ['cat'],
        };

        expect(jsonBody).to.deep.equal(expectedResult);
        expect(getRes.statusCode).to.equal(400);

        done();
      });
    });
  });

  describe('GET /times/:uuid?include_deleted=true', function() {
    it('returns the soft-deleted time that corresponds with the given uuid',
    function(done) {
      request.get(baseUrl +
      'times/b6ac75fb-7872-403f-ab71-e5542fae4212?include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          duration: 12,
          user: 'tschuy',
          project: ['gwm', 'ganeti-webmgr'],
          activities: ['docs'],
          notes: '',
          issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
          date_worked: '2015-04-20',
          created_at: '2015-04-20',
          updated_at: null,
          id: 5,
          uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
          revision: 1,
          deleted_at: '2015-07-04',
        };

        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails with Object Not Found error when given a nonexistent uuid',
    function(done) {
      request.get(baseUrl +
      'times/00000000-0000-0000-0000-000000000000?include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult = {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent time',
        };

        expect(res.statusCode).to.equal(404);
        expect(jsonBody).to.deep.equal(expectedResult);
        done();
      });
    });

    it('fails with Invalid Identifier error when given an invalid uuid',
    function(done) {
      request.get(baseUrl + 'times/nope?include_deleted=true',
      function(err, res, body) {
        const jsonBody = JSON.parse(body);
        const expectedResult =  {
          status: 400,
          error: 'The provided identifier was invalid',
          text: 'Expected UUID but received nope',
          values: ['nope'],
        };

        expect(res.statusCode).to.equal(400);
        expect(jsonBody).to.deep.equal(expectedResult);
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
        deleted_at: null,
        uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
        revision: 1,
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
        deleted_at: null,
        uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
        revision: 1,
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
        deleted_at: null,
        uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
        revision: 1,
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
        deleted_at: null,
        uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
        revision: 1,
        id: 4,
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

      request.post(postArg, function(postErr, postRes, postBody) {
        expect(postErr).to.equal(null);
        expect(postRes.statusCode).to.equal(200);

        time.id = postBody.id;
        time.uuid = postBody.uuid;
        time.revision = 1;

        expect(postBody).to.deep.equal(time);

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
              uuid: time.uuid,
              revision: 1,
              id: 7,
            },
          ]);

          const jsonGetBody = JSON.parse(getBody);
          expectedResults[expectedResults.length - 1].activities.sort();
          jsonGetBody[jsonGetBody.length - 1].activities.sort();

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(jsonGetBody).to.deep.have
          .same.members(expectedResults);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Incorrect password.',
        };

        expect(postRes.statusCode).to.equal(401);
        expect(postBody).to.deep.equal(expectedResult);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Missing credentials',
        };

        expect(postRes.statusCode).to.equal(401);
        expect(postBody).to.deep.equal(expectedResult);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field duration of time should be number but was sent as ' +
                                                                       'string',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a duration',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Invalid foreign key',
          status: 409,
          text: 'The time does not contain a valid activities reference.',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(409);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field activities of time should be array but was sent as ' +
                                                                       'number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a activities',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field project of time should be slug but was sent as invalid' +
          ' slug project? we need a project?',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Invalid foreign key',
          status: 409,
          text: 'The time does not contain a valid project reference.',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(409);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field project of time should be string but was sent as array',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a project',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'Field issue_uri of time should be string but was sent as ' +
                                                                       'number',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
          done();
        });
      });
    });

    it('works with a missing issue URI', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['docs'],
        notes: '',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      request.post(postArg, function(postErr, postRes, postBody) {
        expect(postErr).to.equal(null);
        expect(postRes.statusCode).to.equal(200);

        time.id = postBody.id;
        time.uuid = postBody.uuid;
        time.revision = 1;
        expect(postBody).to.deep.equal(time);

        const createdAt = new Date().toISOString().substring(0, 10);
        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          const expectedResults = initialData.concat([
            {
              duration: 20,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'],
              activities: ['docs'],
              notes: '',
              issue_uri: null,
              date_worked: '2015-07-30',
              created_at: createdAt,
              updated_at: null,
              deleted_at: null,
              uuid: time.uuid,
              revision: 1,
              id: 7,
            },
          ]);
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have
          .same.members(expectedResults);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authorization failure',
          status: 401,
          text: 'tschuy is not authorized to create time entries for jenkinsl',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(401);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a user',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
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

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Bad object',
          status: 400,
          text: 'The time is missing a date_worked',
        };

        expect(postBody).to.deep.equal(expectedResult);
        expect(postRes.statusCode).to.equal(400);

        request.get(baseUrl + 'times', function(getErr, getRes, getBody) {
          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
          done();
        });
      });
    });
  });

  describe('POST /times/:uuid', function() {
    // The database's entry for `Whats Fresh`'s time entry
    const postOriginalTime = {
      duration: 12,
      user: 'deanj',
      project: ['gwm', 'ganeti-webmgr'],
      notes: '',
      activities: ['docs', 'dev'],
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-19',
      uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
      revision: 1,
    };

    const getOriginalTime = {
      duration: 12,
      user: 'deanj',
      project: ['gwm', 'ganeti-webmgr'],
      notes: '',
      activities: ['docs', 'dev'],
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-19',
      created_at: '2015-04-19',
      updated_at: null,
      deleted_at: null,
      uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
      revision: 1,
      id: 1,
    };

    // A completely patched version of the above time entry
    // Only contains valid patch elements.
    const updatedAt = new Date().toISOString().substring(0, 10);
    const postPatchedTime = {
      duration: 15,
      user: 'tschuy',
      project: 'pgd',
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/pgd/pull/19',
      date_worked: '2015-04-28',
    };

    const getPatchedTime = {
      duration: 15,
      user: 'tschuy',
      project: 'pgd',
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/pgd/pull/19',
      date_worked: '2015-04-28',
      created_at: '2015-04-19',
      updated_at: updatedAt,
      deleted_at: null,
      uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
      revision: 2,
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
        type: 'password',
        username: 'deanj',
        password: 'pass',
      },
    };

    const requestOptions = {
      url: baseUrl + 'times/32764929-1bea-4a17-8c8a-22d7fb144941',
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
    function checkPostToEndpoint(done, postObj, expectedResults, error,
    statusCode, postBodies) {
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
          const jsonBody = JSON.parse(body0);
          expectedResults.id = jsonBody.id;
          expect(jsonBody).to.deep.equal(expectedResults);
          done();
        });
      });
    }

    // Tests all valid fields
    it('succesfully patches time with valid duration, user, project,' +
    ' activity notes, issue_uri, and date_worked', function(done) {
      const postObj = copyJsonObject(postPatchedTime);
      const expectedResults = copyJsonObject(getPatchedTime);
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
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
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
      expectedResults.updated_at = updatedAt;
      expectedResults.user = postPatchedTime.user;
      expectedResults.revision = 2;
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
      expectedResults.revision = 2;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid activities field
    it('successfully patches time with valid activities', function(done) {
      const postObj = {activities: postPatchedTime.activities};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.updated_at = updatedAt;
      expectedResults.activities = postPatchedTime.activities;
      expectedResults.revision = 2;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid notes field
    it('successfully patches time with valid notes', function(done) {
      const postObj = {notes: postPatchedTime.notes};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.notes = postPatchedTime.notes;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid issue_uri field
    it('successfully patches time with valid issue_uri', function(done) {
      const postObj = {issue_uri: postPatchedTime.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.issue_uri = postPatchedTime.issue_uri;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests valid date_worked field
    it('successfully patches time with valid date_worked', function(done) {
      const postObj = {date_worked: postPatchedTime.date_worked};
      const expectedResults = copyJsonObject(getOriginalTime);
      expectedResults.date_worked = postPatchedTime.date_worked;
      expectedResults.updated_at = updatedAt;
      expectedResults.revision = 2;
      const statusCode = 200;

      checkPostToEndpoint(done, postObj, expectedResults, undefined,
                 statusCode);
    });

    // Tests all invalid fields
    it('unsuccesfully patches time with invalid duration, user, project,' +
    ' activity, notes, issue_uri, and date_worked dattype', function(done) {
      const postObj = copyJsonObject(invalidTimeDataType);
      const expectedResults = copyJsonObject(getOriginalTime);
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
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      postObj.project = 'gwm';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      postObj.project = 'gwm';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      postObj.project = 'gwm';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      postObj.project = 'gwm';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      postObj.project = 'gwm';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
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
    it('unsuccessfully patches time with just invalid user string',
    function(done) {
      const postObj = {user: invalidTimeValue.user2};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = 'Invalid foreign key';
      const statusCode = 409;
      const postBody = [
        {
          status: 409,
          error: 'Invalid foreign key',
          text: 'The time does not contain a valid user reference.',
        }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                   statusCode, postBody);
    });

    // Test invalid project foreign key
    it('unsuccessfully patches time with just invalid project foreign key',
    function(done) {
      const postObj = {project: invalidTimeValue.project1};
      const expectedResults = copyJsonObject(getOriginalTime);
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
    it('unsuccessfully patches time with just invalid activities foreign ' +
       'key',
    function(done) {
      const postObj = {activities: invalidTimeValue.activities1};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = 'Invalid foreign key';
      const statusCode = 409;
      const postBody = [
        {
          status: 409,
          error: 'Invalid foreign key',
          text: 'The time does not contain a valid activities reference.',
        }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Test invalid activities (invalid formatting)
    it('unsuccessfully patches time with just invalid activities string',
    function(done) {
      const postObj = {user: invalidTimeValue.activities2};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field user of time should be string but was sent as array',
        }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Test bad issue uri (formatting)
    it('unsuccessfully patches time with just invalid issue_uri',
    function(done) {
      const postObj = {issue_uri: invalidTimeValue.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
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
    it('unsuccessfully patches time with just invalid date_worked',
    function(done) {
      const postObj = {date_worked: invalidTimeValue.date_worked};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = 'Bad object';
      const statusCode = 400;
      const postBody = [
        {
          status: 400,
          error: 'Bad object',
          text: 'Field date_worked of time should be ISO-8601 date but was ' +
                  'sent as April 29, 1995',
        }];

      checkPostToEndpoint(done, postObj, expectedResults, error,
                 statusCode, postBody);
    });
  });

  describe('DELETE /times/:uuid', function() {
    it('deletes the object with a valid uuid', function(done) {
      const expectedResults = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent time',
      };

      request.del(baseUrl + 'times/32764929-1bea-4a17-8c8a-22d7fb144941',
      function(err, res, body) {
        expect(body.error).to.equal(undefined);
        expect(res.statusCode).to.equal(200);

        request.get(baseUrl + 'times/32764929-1bea-4a17-8c8a-22d7fb144941',
        function(getErr, getRes, getBody) {
          // TODO: GET should only return 200 when ?revisions=true is passed.
          expect(getRes.statusCode).to.equal(404);
          expect(JSON.parse(getBody)).to.deep.equal(expectedResults);
          done();
        });
      });
    });

    it('fails to delete the object with a non-existent uuid', function(done) {
      const expectedError = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent uuid',
      };
      request.del(baseUrl + 'times/66666666-6666-6666-6666-666666666666',
      function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(404);
        done();
      });
    });

    it('fails to delete the object with an invalid uuid', function(done) {
      const expectedError = {
        'status': 400,
        'error': 'The provided identifier was invalid',
        'text': 'Expected uuid but received myuuid',
        'values': ['myuuid'],
      };
      request.del(baseUrl + 'times/myuuid', function(err, res, body) {
        expect(JSON.parse(body)).to.deep.equal(expectedError);
        expect(res.statusCode).to.equal(400);
        done();
      });
    });
  });
};
