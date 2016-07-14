'use strict';

function copyJsonObject(obj) {
  // This allows us to change object properties
  // without affecting other tests
  return JSON.parse(JSON.stringify(obj));
}

let user = 'tschuy';
let password = 'password';

module.exports = function(expect, request, baseUrl) {
  function getAPIToken() {
    const requestOptions = {
      url: baseUrl + 'login',
      json: true,
    };
    requestOptions.body = {
      auth: {
        type: 'password',
        username: user,
        password: password,
      },
    };
    return new Promise(function(resolve) {
      request.post(requestOptions, function(err, res, body) {
        expect(err).to.be.a('null');
        expect(res.statusCode).to.equal(200);

        resolve(body.token);
      });
    });
  }

  /* GET one of the /times endpoints and check its response against
  what should be returned */
  describe('GET /times', function() {
    it('returns all times in the database to an admin', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?token=' + token,
        function(getErr, getRes, getBody) {
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
            },
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
            },
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
            },
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have
            .same.members(expectedResults);
          done();
        });
      });
    });

    it('returns all times in the database to a sitewide spectator',
    function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        request.get(baseUrl + 'times?token=' + token,
        function(getErr, getRes, getBody) {
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
            },
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
            },
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
            },
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have
            .same.members(expectedResults);
          done();
        });
      });
    });

    it("returns only a normal user's times", function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'thai';
      password = 'passing';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        request.get(baseUrl + 'times?token=' + token,
        function(getErr, getRes, getBody) {
          const expectedResults = [
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
            },
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have
            .same.members(expectedResults);
          done();
        });
      });
    });

    it("returns a project spectator's set of times", function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'deanj';
      password = 'pass';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        request.get(baseUrl + 'times?token=' + token,
        function(getErr, getRes, getBody) {
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
            },
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
            },
          ];

          expect(getErr).to.be.a('null');
          expect(getRes.statusCode).to.equal(200);
          expect(JSON.parse(getBody)).to.deep.have
            .same.members(expectedResults);
          done();
        });
      });
    });
  });

  describe('GET /times?user=:user', function() {
    it('returns all times for a user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

    it('returns an error for a non-existent user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=fakeuser&token=' + token,
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
  });

  describe('GET /times?project=:project', function() {
    it('returns all times for a project', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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

    it('returns an error for a non-existent project', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=notreal&token=' + token,
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
  });

  describe('GET /times?activity=:activity', function() {
    it('returns all times for an activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=docs&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
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

    it('returns an error for a non-existent activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=falsch&token=' + token,
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
  });

  describe('GET /times?start=:start', function() {
    it('returns all times after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=2015-04-20&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
            },
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
            },
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
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

    it('returns an error for an invalid start date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=faux&token=' + token,
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
    });

    it('returns an error for a future start date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=2105-04-19&token=' + token,
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
  });

  describe('GET /times?end=:end', function() {
    it('returns all times before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?end=2015-04-21&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

    it('returns an error for an invalid end date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?end=namaak&token=' + token,
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
  });

  describe('GET /times?start=:start&end=:end', function() {
    it('returns all times between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=2015-04-20' +
        '&end=2015-04-21&token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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

    it('returns an error for a start date after an end date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=2015-04-21&end=2015-04-19' +
        '&token=' + token, function(getErr, getRes, getBody) {
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
  });

  describe('GET /times?user=:user1&user=:user2', function() {
    it('returns all times for two users', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&user=patcht&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
            },
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
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
  });

  describe('GET /times?user=:user&project=:project', function() {
    it('returns all times for a user and a project', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&project=gwm&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?user=:user&activity=:activity', function() {
    it('returns all times for a user and an activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&activity=docs&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?user=:user&start=:start', function() {
    it('returns all times for a user after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&start=2015-04-20&' +
        'token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['pgd'],
              activities: ['sys'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-21',
              created_at: '2015-04-21',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
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
  });

  describe('GET /times?user=:user&end=:end', function() {
    it('returns all times for a user before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&end=2015-04-21&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
  });

  describe('GET /times?user=:user&start=:start&end=:end', function() {
    it('returns all times for a user between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&start=2015-04-19' +
        '&end=2015-04-20&token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?project=:project1&project=:project2', function() {
    it('returns all times for two projects', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&project=wf&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
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
  });

  describe('GET /times?project=:project&activity=:activity', function() {
    it('returns all times for a project and an activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&activity=dev&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?project=:project&start=:start', function() {
    it('returns all times for a project after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&start=2015-04-20&' +
        'token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
  });

  describe('GET /times?project=:project&end=:end', function() {
    it('returns all times for a project before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&end=2015-04-20&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
  });

  describe('GET /times?project=:project&start=:start&end=:end', function() {
    it('returns all times for a project between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&start=2015-04-19' +
        '&end=2015-04-21&token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
              revision: 1,
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
  });

  describe('GET /times?activity=:activity1&activity=:activity2', function() {
    it('returns all times for two activities', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=docs&activity=dev&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
            },
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
            },
            {
              duration: 18,
              user: 'thai',
              project: ['wf'],
              activities: ['docs'],
              notes: '',
              issue_uri: '',
              date_worked: '2016-02-25',
              created_at: '2016-02-25',
              updated_at: null,
              uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
              revision: 1,
              deleted_at: null,
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
  });

  describe('GET /times?activity=:activity&start=:start', function() {
    it('returns all times for an activity after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&start=2015-04-20&' +
        'token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'patcht',
              project: ['pgd'],
              activities: ['dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-22',
              created_at: '2015-04-22',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
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
  });

  describe('GET /times?activity=:activity&end=:end', function() {
    it('returns all times for an activity before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&end=2015-04-21&' +
        'token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?activity=:activity&start=:start&end=:end', function() {
    it('returns all times for an activity between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&start=2015-04-19' +
        '&end=2015-04-21&token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?user=:user&project=:project&activity=:activity&' +
  'start=:start&end=:end', function() {
    it('returns all times for a user, project, and activity between two dates',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&project=gwm&' +
        'activity=docs&start=2015-04-20&end=2015-04-22&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
  });

  describe('GET /times?user=:user1&user=:user2&project=:project&' +
  'activity=:activity&start=:start&end=:end', function() {
    it('returns all times for two users, a project, and activity ' +
    'between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&user=tschuy&project=gwm&' +
        'activity=docs&start=2015-04-19&end=2015-04-21&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            },
            {
              duration: 12,
              user: 'tschuy',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-20',
              created_at: '2015-04-20',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
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
  });

  describe('GET /times?user=:user&project=:project1&project=:project2&' +
  'activity=:activity&start=:start&end=:end', function() {
    it('returns all times for a user, two projects, and an ' +
    'activity between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&project=gwm&project=pgd&' +
        'activity=docs&start=2015-04-19&end=2015-04-20&token=' + token,
        function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'],
              activities: ['docs', 'dev'],
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?user=:user&project=:project&activity=:activity1&' +
  'activity=:activity2&start=:start&end=:end', function() {
    it('returns all times for a user, project, and two activities ' +
    'between two dates', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=deanj&project=gwm&' +
        'activity=docs&activity=dev&start=2015-04-19&end=2015-04-20&' +
        'token=' + token, function(getErr, getRes, getBody) {
          const jsonBody = JSON.parse(getBody);
          const expectedResults = [
            {
              duration: 12,
              user: 'deanj',
              project: ['gwm', 'ganeti-webmgr'].sort(),
              activities: ['docs', 'dev'].sort(),
              notes: '',
              issue_uri:
                'https://github.com/osu-cass/whats-fresh-api/issues/56',
              date_worked: '2015-04-19',
              created_at: '2015-04-19',
              updated_at: null,
              deleted_at: null,
              revision: 1,
              uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
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
  });

  describe('GET /times?include_deleted=true', function() {
    const softDeletedTimes = [
      {
        duration: 12,
        user: 'tschuy',
        project: ['ganeti-webmgr', 'gwm'].sort(),
        activities: ['docs'],
        notes: '',
        issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: null,
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
        uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
        revision: 1,
        deleted_at: '2015-08-12',
      },
    ];

    it('returns a list of all active and deleted times', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?include_deleted=true&token=' + token,
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
  });

  describe('GET /times?user=:user&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&include_deleted=true&token=' +
        token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });

    it('fails when given a nonexistent user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=notauser&include_deleted=true&' +
        'token=' + token, function(err, res, body) {
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
    });

    it('fails when given an invalid user', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=wh4t3v3n.isTh%s&include_deleted=' +
        'true&token=' + token, function(err, res, body) {
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
  });

  describe('GET /times?activity=:activity&include_deleted=true', function() {
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for an activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&include_deleted=true&token=' +
        token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });

    it('fails when given a nonexistent activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=review&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
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
    });

    it('fails when given an invalid activity', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=w_hA.t&include_deleted=true' +
        '&token=' + token,
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
  });

  describe('GET /times?project=:project?include_deleted=true', function() {
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for a project', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=pgd&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });

    it('fails when given a nonexistent project', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=chili&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
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
    });

    it('fails when given an invalid project', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=not@slug!&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=2015-04-22&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });

    it('fails when given an invalid start date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=notaday&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
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
    });

    it('fails when given a future start date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?start=3015-04-22&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
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
  });

  describe('GET /times?end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?end=2015-04-20&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });

    it('fails if given an invalid end date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?end=theend&include_deleted=true' +
        '&token=' + token, function(err, res, body) {
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
  });

  describe('GET /times?user=:user&activity=:activity&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given user and activity',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&activity=docs' +
        '&include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given user and project',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=patcht&project=pgd' +
        '&include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?user=:user&start:=start&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a user after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&start=2015-04-20&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for a user before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=patcht&end=2015-04-22&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?user=:user&start:=start&end=:end&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a user within a date range', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&start=2015-04-20&' +
        'end=:2015-04-25&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given user, activity, and project',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=patcht&activity=dev&project=pgd&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given parameters after a date',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=patcht&activity=dev&project=pgd&' +
        '&start=2015-04-22&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?user=:user&activitiy=:activity&project=:project&' +
  'end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given parameters before a date',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&activity=docs&project=gwm&' +
        'end=2015-04-22&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?user=:user&activitiy=:activity&project=:project&' +
  'start=:start&end=:end&include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given parameters within a date ' +
    'range', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?user=tschuy&activity=docs&project=gwm&' +
        '&start=2015-04-19&end=2015-04-22&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?activity=:activity&project=:project&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given activity and project',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=docs&project=gwm&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?activity=:activity&start=:start&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for an activity after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=docs&start=:2015-04-17&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?activitiy=:activity&end=:end&include_deleted=true',
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for an activity before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&end=2015-04-25&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?activitiy=:activity&start=:start&end=:end&' +
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for an activity within a date range',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&start=2015-04-22&' +
        'end=2015-04-25&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?project=:project&start=:start&include_deleted=true',
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times for a project after a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=pgd&start=2015-04-20&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?project=:project&end=:end&include_deleted=true',
  function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a project before a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&end=2015-04-20&' +
        'include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?project=:project&start=:start&end=:end&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times for a project within a date range', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?project=gwm&start=2015-04-20&' +
        'end=2015-04-25&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times?activity=:activity&project=:project&start=:start&' +
  'include_deleted=true', function() {
    const softDeletedTimes = {
      duration: 12,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      uuid: 'b6ac75fb-7872-403f-ab71-e5542fae4212',
      revision: 1,
      deleted_at: '2015-07-04',
    };

    it('returns all times that match the given activity and project after ' +
    'a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=docs&project=gwm&' +
        'start=2015-04-17&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given activity and project before ' +
    'a date', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&project=pgd&' +
        'end=2015-04-25&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
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
      uuid: '58e07b73-596d-472b-adcc-ea68599657f7',
      revision: 1,
      deleted_at: '2015-08-12',
    };

    it('returns all times that match the given activity and project within ' +
    'a date range', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times?activity=dev&project=pgd&' +
        'start=2015-04-21&end=2015-04-25&include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);
          expect(jsonBody).to.include(softDeletedTimes);
          done();
        });
      });
    });
  });

  describe('GET /times/:uuid', function() {
    it('returns times by uuid', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/32764929-1bea-4a17-8c8a-22d7fb144941' +
        '?token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            duration: 12,
            user: 'deanj',
            project: ['gwm', 'ganeti-webmgr'].sort(),
            activities: ['docs', 'dev'].sort(),
            notes: '',
            issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
            date_worked: '2015-04-19',
            created_at: '2015-04-19',
            updated_at: null,
            deleted_at: null,
            uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
            revision: 1,
          };

          expect(err).to.be.a('null');
          expect(res.statusCode).to.equal(200);

          expect(jsonBody).to.deep.equal(expectedResult);
          done();
        });
      });
    });

    it('fails with Object not found error', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/00000000-0000-0000-0000-000000000000' +
        '?token=' + token, function(err, res, body) {
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
    });

    it('fails with Invalid Identifier error', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/cat?token=' + token,
        function(getErr, getRes, getBody) {
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
  });

  describe('GET /times/:uuid?include_deleted=true', function() {
    it('returns the soft-deleted time that corresponds with the given uuid',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/b6ac75fb-7872-403f-ab71-e5542fae4212' +
        '?include_deleted=true&token=' + token, function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
            duration: 12,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'].sort(),
            activities: ['docs'],
            notes: '',
            issue_uri: 'https://github.com/osuosl/ganeti_webmgr/issues/48',
            date_worked: '2015-04-20',
            created_at: '2015-04-20',
            updated_at: null,
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
    });

    it('fails with Object Not Found error when given a nonexistent uuid',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/00000000-0000-0000-0000-000000000000' +
        '?include_deleted=true&token=' + token, function(err, res, body) {
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
    });

    it('fails with Invalid Identifier error when given an invalid uuid',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/nope?include_deleted=true&token=' + token,
        function(err, res, body) {
          const jsonBody = JSON.parse(body);
          const expectedResult = {
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
  });

  describe('POST /times', function() {
    function getPostObject(uri, time) {
      return {
        uri: uri,
        json: true,
        body: {
          auth: {
            type: 'token',
          },
          object: time,
        },
      };
    }

    const initialData = [
      {
        duration: 12,
        user: 'deanj',
        project: ['gwm', 'ganeti-webmgr'].sort(),
        activities: ['docs', 'dev'].sort(),
        notes: '',
        issue_uri:
          'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-19',
        created_at: '2015-04-19',
        updated_at: null,
        deleted_at: null,
        revision: 1,
        uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
      },
      {
        duration: 12,
        user: 'tschuy',
        project: ['gwm', 'ganeti-webmgr'].sort(),
        activities: ['docs'],
        notes: '',
        issue_uri:
          'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: null,
        deleted_at: null,
        revision: 1,
        uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      },
      {
        duration: 12,
        user: 'deanj',
        project: ['pgd'],
        activities: ['sys'],
        notes: '',
        issue_uri:
          'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-21',
        created_at: '2015-04-21',
        updated_at: null,
        deleted_at: null,
        revision: 1,
        uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
      },
      {
        duration: 12,
        user: 'patcht',
        project: ['pgd'],
        activities: ['dev'],
        notes: '',
        issue_uri:
          'https://github.com/osu-cass/whats-fresh-api/issues/56',
        date_worked: '2015-04-22',
        created_at: '2015-04-22',
        updated_at: null,
        deleted_at: null,
        revision: 1,
        uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
      },
      {
        duration: 18,
        user: 'thai',
        project: ['wf'],
        activities: ['docs'],
        notes: '',
        issue_uri: '',
        date_worked: '2016-02-25',
        created_at: '2016-02-25',
        updated_at: null,
        uuid: '339f0d41-dd83-434f-81ca-9666a1c96f99',
        revision: 1,
        deleted_at: null,
      },
    ];

    it('creates a new time with activities', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);

        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          expect(postErr).to.equal(null);
          expect(postRes.statusCode).to.equal(200);

          time.uuid = postBody.uuid;
          time.revision = 1;

          expect(postBody).to.deep.equal(time);

          const createdAt = new Date().toISOString().substring(0, 10);
          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            const expectedResults = initialData.concat([
              {
                duration: 20,
                user: 'tschuy',
                project: ['gwm', 'ganeti-webmgr'].sort(),
                activities: ['docs', 'dev'].sort(),
                notes: '',
                issue_uri: 'https://github.com/osuosl/gwm/issues/1',
                date_worked: '2015-07-30',
                created_at: createdAt,
                updated_at: null,
                deleted_at: null,
                uuid: time.uuid,
                revision: 1,
              },
            ]);

            const jsonGetBody = JSON.parse(getBody);
            expectedResults[expectedResults.length - 1].activities.sort();
            jsonGetBody[jsonGetBody.length - 1].activities.sort();

            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(jsonGetBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    it('creates a new time with default activity', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'ts',
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);

        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          expect(postErr).to.equal(null);
          expect(postRes.statusCode).to.equal(200);

          time.uuid = postBody.uuid;
          time.revision = 1;

          expect(postBody).to.deep.equal(time);

          const createdAt = new Date().toISOString().substring(0, 10);
          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            const expectedResults = initialData.concat([
              {
                duration: 20,
                user: 'tschuy',
                project: ['ts', 'timesync'].sort(),
                activities: ['dev'],
                notes: '',
                issue_uri: 'https://github.com/osuosl/gwm/issues/1',
                date_worked: '2015-07-30',
                created_at: createdAt,
                updated_at: null,
                deleted_at: null,
                uuid: time.uuid,
                revision: 1,
              },
            ]);

            const jsonGetBody = JSON.parse(getBody);
            expectedResults[expectedResults.length - 1].activities.sort();
            jsonGetBody[jsonGetBody.length - 1].activities.sort();

            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(jsonGetBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    it('fails with a bad token', function(done) {
      const time = {
        duration: 20,
        user: 'tschuy',
        project: 'gwm',
        activities: ['dev', 'docs'].sort(),
        notes: '',
        issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        date_worked: '2015-07-30',
      };

      const postArg = getPostObject(baseUrl + 'times/', time);

      postArg.body.auth.token = 'not_a_token';

      request.post(postArg, function(postErr, postRes, postBody) {
        const expectedResult = {
          error: 'Authentication failure',
          status: 401,
          text: 'Bad API token',
        };

        expect(postRes.statusCode).to.equal(401);
        expect(postBody).to.deep.equal(expectedResult);


        getAPIToken().then(function(token) {
          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it("fails when user isn't member of project", function(done) {
      const oldUser = user;
      const oldPass = password;

      user = 'thai';
      password = 'passing';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        const time = {
          duration: 20,
          user: 'thai',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);

        postArg.body.auth.token = token;

        request.post(postArg, function(err, res, body) {
          const expectedResult = {
            error: 'Authorization failure',
            status: 401,
            text: 'thai is not authorized to create time entries for project ' +
            'gwm.',
          };

          expect(res.statusCode).to.equal(401);
          expect(body).to.deep.equal(expectedResult);

          getAPIToken().then(function(newToken) {
            request.get(baseUrl + 'times?token=' + newToken,
            function(getErr, getRes, getBody) {
              expect(getErr).to.be.a('null');
              expect(getRes.statusCode).to.equal(200);
              expect(JSON.parse(getBody)).to.deep.equal(initialData);
              done();
            });
          });
        });
      });
    });

    it('fails with a missing token', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Authentication failure',
            status: 401,
            text: 'Missing credentials',
          };

          expect(postRes.statusCode).to.equal(401);
          expect(postBody).to.deep.equal(expectedResult);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a negative duration', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: -20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);

        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field duration of time should be positive number ' +
            'but was sent as negative number',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-numeric duration', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 'twenty',
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field duration of time should be number but was sent as ' +
                                                                      'string',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a missing duration', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);

        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a duration',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a bad activity', function(done) {
      getAPIToken().then(function(token) {
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

        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field activities of time should be slugs but was sent as ' +
            'array containing at least 1 invalid slug',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-existent activity', function(done) {
      getAPIToken().then(function(token) {
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
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Invalid foreign key',
            status: 409,
            text: 'The time does not contain a valid activities reference.',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(409);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-string activity', function(done) {
      getAPIToken().then(function(token) {
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
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field activities of time should be slugs but was sent as ' +
            'array containing at least 1 number',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-array activities', function(done) {
      getAPIToken().then(function(token) {
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
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field activities of time should be array but was sent as ' +
                                                                      'number',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with missing activities', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a activities',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a bad project', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'project? we need a project?',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field project of time should be slug but was sent as' +
            ' invalid slug project? we need a project?',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-existent project', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'project-xyz',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Invalid foreign key',
            status: 409,
            text: 'The time does not contain a valid project reference.',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(409);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-string project', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: ['Who needs', 'proper types?'],
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field project of time should be string but was sent as' +
                  ' array',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a missing project', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a project',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a bad issue URI', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'I do my own thing, pal',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field issue_uri of time should be URI but was sent as ' +
            'invalid URI I do my own thing, pal',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-string issue URI', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 3.14159265,
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field issue_uri of time should be string but was sent as ' +
                                                                      'number',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('works with a missing issue URI', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['docs'],
          notes: '',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        const createdAt = new Date().toISOString().substring(0, 10);
        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResults = initialData.concat([{
            duration: 20,
            user: 'tschuy',
            project: ['gwm', 'ganeti-webmgr'].sort(),
            activities: ['docs'],
            notes: '',
            issue_uri: null,
            date_worked: '2015-07-30',
            created_at: createdAt,
            updated_at: null,
            deleted_at: null,
            uuid: postBody.uuid,
            revision: 1,
          }]);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have
            .same.members(expectedResults);
            done();
          });
        });
      });
    });

    it('fails with a bad user', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'jenkinsl',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Authorization failure',
            status: 401,
            text: 'tschuy is not authorized to create time entries for' +
                  ' jenkinsl',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(401);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-string user', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: {username: 'tschuy'},
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field user of time should be string but ' +
            'was sent as object',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a missing user', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: '2015-07-30',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a user',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a bad date worked', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: 'baaaaaaaad',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field date_worked of time should be ISO-8601 date ' +
            'but was sent as baaaaaaaad',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a non-string date worked', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
          date_worked: 1234,
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field date_worked of time should be string ' +
            'but was sent as number',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });

    it('fails with a missing date worked', function(done) {
      getAPIToken().then(function(token) {
        const time = {
          duration: 20,
          user: 'tschuy',
          project: 'gwm',
          activities: ['dev', 'docs'].sort(),
          notes: '',
          issue_uri: 'https://github.com/osuosl/gwm/issues/1',
        };

        const postArg = getPostObject(baseUrl + 'times/', time);
        postArg.body.auth.token = token;

        request.post(postArg, function(postErr, postRes, postBody) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a date_worked',
          };

          expect(postBody).to.deep.equal(expectedResult);
          expect(postRes.statusCode).to.equal(400);

          request.get(baseUrl + 'times?token=' + token,
          function(getErr, getRes, getBody) {
            expect(getErr).to.be.a('null');
            expect(getRes.statusCode).to.equal(200);
            expect(JSON.parse(getBody)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });
    });
  });

  describe('POST /times/:uuid', function() {
    // The database's entry for `Whats Fresh`'s time entry
    const postOriginalTime = {
      duration: 12,
      user: 'deanj',
      project: ['ganeti-webmgr', 'gwm'],
      notes: '',
      activities: ['dev', 'docs'],
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-20',
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      revision: 1,
    };

    const getOriginalTime = {
      duration: 12,
      user: 'deanj',
      project: ['ganeti-webmgr', 'gwm'],
      activities: ['dev', 'docs'],
      notes: '',
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-19',
      created_at: '2015-04-19',
      updated_at: null,
      uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
      revision: 1,
      deleted_at: null,
    };

    // A completely patched version of the above time entry
    // Only contains valid patch elements.
    const updatedAt = new Date().toISOString().substring(0, 10);
    const postPatchedTime = {
      duration: 15,
      project: 'pgd',
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/pgd/pull/19',
      date_worked: '2015-04-28',
    };

    const getPatchedTime = {
      duration: 15,
      user: 'deanj',
      project: ['pgd'],
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/pgd/pull/19',
      date_worked: '2015-04-28',
      created_at: '2015-04-19',
      updated_at: null,
      uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
      revision: 2,
      deleted_at: null,
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
        type: 'token',
      },
    };

    const requestOptions = {
      url: baseUrl + 'times/32764929-1bea-4a17-8c8a-22d7fb144941',
      json: true,
    };

    /*
     * Okay so here's the deal.
     * This endpoint has ~26 tests, which are honestly just 3 tests
     * repeated 7 or 8 times (with a few exceptions).
     * This function in theory gets rid of a lot of the repeated code in
     * the tests.
     * Without this function you would see this exact code pretty 26
     * times over.
     */
    function checkPostToEndpoint(done, uri, postObj, expectedResults, error,
    statusCode, postBodies) {
      getAPIToken().then(function(token) {
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
          request.get(requestOptions.url + '?token=' + token,
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

    // Tests all valid fields
    it('succesfully patches time with valid duration, project,' +
    ' activity notes, issue_uri, and date_worked by an admin', function(done) {
      const postObj = copyJsonObject(postPatchedTime);
      const expectedResults = copyJsonObject(getPatchedTime);
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
    });

    it('succesfully patches time with valid duration, project,' +
    ' activity notes, issue_uri, and date_worked by the user', function(done) {
      const postObj = copyJsonObject(postPatchedTime);
      const expectedResults = copyJsonObject(getPatchedTime);
      expectedResults.project = ['pgd'];
      let error;
      const statusCode = 200;

      const oldUser = user;
      const oldPass = password;

      user = 'deanj';
      password = 'pass';
      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode);
      user = oldUser;
      password = oldPass;
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, undefined,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, undefined,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, undefined,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, undefined,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, undefined,
                 statusCode);
    });

    it('unsuccessfully patches a non-existent time', function(done) {
      const uri = baseUrl + 'times/00000000-0000-0000-0000-000000000000';
      const postObj = {duration: postPatchedTime.duration};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = 'Object not found';
      const statusCode = 404;
      const postBody = [
        {
          status: 404,
          error: 'Object not found',
          text: 'Nonexistent time',
        },
      ];

      checkPostToEndpoint(done, uri, postObj, expectedResults, error,
                 statusCode, postBody);
    });

    // Tests all invalid fields
    it('unsuccesfully patches time with invalid duration, project,' +
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
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

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, postBody);
    });
  });

  describe('GET /times/?include_revisions=true', function() {
    const currentTime = new Date().toISOString().substring(0, 10);

    const noParentsData = {
      duration: 13,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'],
      activities: ['docs'],
      notes: 'forgot to add last hour',
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: currentTime,
      deleted_at: null,
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      revision: 2,
    };

    const withParentsData = {
      duration: 13,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'],
      activities: ['docs'],
      notes: 'forgot to add last hour',
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: currentTime,
      deleted_at: null,
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      revision: 2,
      parents: [
        {
          duration: 12,
          user: 'tschuy',
          project: ['ganeti-webmgr', 'gwm'],
          activities: ['docs'],
          notes: '',
          issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
          date_worked: '2015-04-20',
          created_at: '2015-04-20',
          updated_at: null,
          deleted_at: null,
          uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
          revision: 1,
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

      const time = 'e0326905-ef25-46a0-bacd-4391155aca4a';
      const postTime = {
        duration: 13,
        notes: 'forgot to add last hour',
      };
      const postArg = getPostObject(baseUrl + 'times/' + time, postTime);

      getAPIToken().then(function(token) {
        postArg.body.auth.token = token;
        request.post(postArg, function() {
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets times + revisions when include_revisions=true', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/?include_revisions=true&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(withParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets times + revisions when include_revisions is an empty parameter',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/?include_revisions&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(withParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just times when include_revisions=false', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/?include_revisions=false&token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just times when include_revisions is not set', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.include(noParentsData);
          done();
        });
      });
    });
  });

  describe('GET /times/:uuid?include_revisions=true', function() {
    const currentTime = new Date().toISOString().substring(0, 10);
    const time = 'e0326905-ef25-46a0-bacd-4391155aca4a';

    const noParentsData = {
      duration: 13,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'],
      activities: ['docs'],
      notes: 'forgot to add last hour',
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: currentTime,
      deleted_at: null,
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      revision: 2,
    };

    const withParentsData = {
      duration: 13,
      user: 'tschuy',
      project: ['ganeti-webmgr', 'gwm'],
      activities: ['docs'],
      notes: 'forgot to add last hour',
      issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: currentTime,
      deleted_at: null,
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      revision: 2,
      parents: [
        {
          duration: 12,
          user: 'tschuy',
          project: ['ganeti-webmgr', 'gwm'],
          activities: ['docs'],
          notes: '',
          issue_uri: 'https://github.com/osu-cass/whats-fresh-api/issues/56',
          date_worked: '2015-04-20',
          created_at: '2015-04-20',
          updated_at: null,
          deleted_at: null,
          uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
          revision: 1,
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

      const postTime = {
        duration: 13,
        notes: 'forgot to add last hour',
      };
      const postArg = getPostObject(baseUrl + 'times/' + time, postTime);

      getAPIToken().then(function(token) {
        postArg.body.auth.token = token;
        request.post(postArg, function() {
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets time + revisions when include_revisions=true', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/' + time + '?include_revisions=true&' +
        'token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(withParentsData);
          expect(JSON.parse(body)).to.not.deep.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions includes revisions
    it('gets times + revisions when include_revisions is an empty parameter',
    function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/' + time + '?include_revisions&token=' +
        token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(withParentsData);
          expect(JSON.parse(body)).to.not.deep.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions isn't always set to true
    it('gets just time when include_revisions=false', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/' + time + '?include_revisions=false&' +
        'token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(noParentsData);
          done();
        });
      });
    });

    // Tests that include_revisions defaults to false
    it('gets just time when include_revisions is not set', function(done) {
      getAPIToken().then(function(token) {
        request.get(baseUrl + 'times/' + time + '?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(noParentsData);
          done();
        });
      });
    });
  });

  describe('DELETE /times/:uuid', function() {
    it('deletes the object with a valid uuid by an admin', function(done) {
      const expectedResults = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent time',
      };

      getAPIToken().then(function(token) {
        request.del(baseUrl +
        'times/32764929-1bea-4a17-8c8a-22d7fb144941?token=' + token,
        function(err, res, body) {
          expect(body.error).to.equal(undefined);
          expect(res.statusCode).to.equal(200);

          request.get(baseUrl +
          'times/32764929-1bea-4a17-8c8a-22d7fb144941?token=' + token,
          function(getErr, getRes, getBody) {
            // TODO: GET should only return 200 when ?revisions=true is passed.
            expect(getRes.statusCode).to.equal(404);
            expect(JSON.parse(getBody)).to.deep.equal(expectedResults);
            done();
          });
        });
      });
    });

    it('deletes the object with a valid uuid by the user', function(done) {
      const expectedResults = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent time',
      };

      const oldUser = user;
      const oldPass = password;

      user = 'deanj';
      password = 'pass';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        request.del(baseUrl +
        'times/32764929-1bea-4a17-8c8a-22d7fb144941?token=' + token,
        function(err, res, body) {
          expect(body.error).to.equal(undefined);
          expect(res.statusCode).to.equal(200);

          request.get(baseUrl +
          'times/32764929-1bea-4a17-8c8a-22d7fb144941?token=' + token,
          function(getErr, getRes, getBody) {
            // TODO: GET should only return 200 when ?revisions=true is passed.
            expect(getRes.statusCode).to.equal(404);
            expect(JSON.parse(getBody)).to.deep.equal(expectedResults);
            done();
          });
        });
      });
    });

    it('fails to delete the object with a non-existent uuid', function(done) {
      const expectedError = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent uuid',
      };
      getAPIToken().then(function(token) {
        request.del(baseUrl +
        'times/66666666-6666-6666-6666-666666666666?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(404);
          done();
        });
      });
    });

    it('fails to delete the object with an invalid uuid', function(done) {
      const expectedError = {
        'status': 400,
        'error': 'The provided identifier was invalid',
        'text': 'Expected uuid but received myuuid',
        'values': ['myuuid'],
      };
      getAPIToken().then(function(token) {
        request.del(baseUrl + 'times/myuuid?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(400);
          done();
        });
      });
    });

    it('fails to delete the object with invalid permissions', function(done) {
      const expectedError = {
        'status': 401,
        'error': 'Authorization failure',
        'text': 'mrsj is not authorized to delete time ' +
          '32764929-1bea-4a17-8c8a-22d7fb144941',
      };

      const oldUser = user;
      const oldPass = password;

      user = 'mrsj';
      password = 'word';
      getAPIToken().then(function(token) {
        user = oldUser;
        password = oldPass;

        request.del(baseUrl +
          'times/32764929-1bea-4a17-8c8a-22d7fb144941?token=' + token,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal(expectedError);
          expect(res.statusCode).to.equal(401);
          done();
        });
      });
    });
  });
};
