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
        expect(body).to.include.keys(['token']);
        expect(res.statusCode).to.equal(200);

        resolve(body.token);
      });
    });
  }

  const initialDataWithDeleted = [
    {
      duration: 12,
      user: 'pManager',
      project: ['project1', 'p1'].sort(),
      activities: ['docs', 'dev'].sort(),
      notes: '',
      issue_uri:
        'http://example.com/project3/issues/56',
      date_worked: '2015-04-19',
      created_at: '2015-04-19',
      updated_at: null,
      deleted_at: null,
      revision: 1,
      uuid: '32764929-1bea-4a17-8c8a-22d7fb144941',
    },
    {
      duration: 12,
      user: 'admin1',
      project: ['project1', 'p1'].sort(),
      activities: ['docs'],
      notes: '',
      issue_uri:
        'http://example.com/project3/issues/56',
      date_worked: '2015-04-20',
      created_at: '2015-04-20',
      updated_at: null,
      deleted_at: null,
      revision: 1,
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
    },
    {
      duration: 12,
      user: 'pManager',
      project: ['project2'],
      activities: ['sys'],
      notes: '',
      issue_uri:
        'http://example.com/project3/issues/56',
      date_worked: '2015-04-21',
      created_at: '2015-04-21',
      updated_at: null,
      deleted_at: null,
      revision: 1,
      uuid: '4bfd7dcf-3fda-4488-a530-60b65d9e77a9',
    },
    {
      duration: 12,
      user: 'sManager',
      project: ['project2'],
      activities: ['dev'],
      notes: '',
      issue_uri:
        'http://example.com/project3/issues/56',
      date_worked: '2015-04-22',
      created_at: '2015-04-22',
      updated_at: null,
      deleted_at: null,
      revision: 1,
      uuid: 'd24c191f-305c-4646-824d-433bbd86fcec',
    },
    {
      duration: 18,
      user: 'user1',
      project: ['project3'],
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
    {
      duration: 12,
      user: 'admin1',
      project: ['p1', 'project1'].sort(),
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
      user: 'sManager',
      project: ['project2'],
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
  const initialData = initialDataWithDeleted.filter(t => {
    return t.deleted_at === null;
  });

  /* GET one of the /times endpoints and check its response against
  what should be returned */
  describe('GET', function() {
    describe('/times', function() {
      it('returns all times in the database to an admin', function(done) {
        getAPIToken().then(function(token) {
          request.get(`${baseUrl}times?token=${token}`,
          function(err, res, body) {
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });

      it('returns all times in the database to a sitewide spectator',
      function(done) {
        getAPIToken('sSpectator', 'word').then(function(token) {
          request.get(`${baseUrl}times?token=${token}`,
          function(err, res, body) {
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(initialData);
            done();
          });
        });
      });

      it("returns only a normal user's times", function(done) {
        const user = 'user1';
        getAPIToken(user, 'passing').then(function(token) {
          request.get(`${baseUrl}times?token=${token}`,
          function(err, res, body) {
            const expectedResults = initialData.filter(t => {
              return t.user === user;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it("returns a project spectator's set of times", function(done) {
        getAPIToken('pManager', 'pass').then(function(token) {
          request.get(`${baseUrl}times?token=${token}`,
          function(err, res, body) {
            const expectedResults = initialData.filter(t => {
              // pManager is spectator on project2 and project1
              return t.project.indexOf('project2') >= 0 ||
                     t.project.indexOf('project1') >= 0;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user', function() {
      it('returns all times for a user', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          request.get(`${baseUrl}times?user=${u}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('returns an error for a non-existent user', function(done) {
        getAPIToken().then(function(token) {
          const u = 'fakeuser';
          request.get(`${baseUrl}times?user=${u}&token=${token}`,
          function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter user contained invalid value ${u}`,
            };

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?project=:project', function() {
      it('returns all times for a project', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          request.get(`${baseUrl}times?project=${p}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.project.indexOf(p) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('returns an error for a non-existent project', function(done) {
        getAPIToken().then(function(token) {
          const p = 'notreal';
          request.get(`${baseUrl}times?project=${p}&token=${token}`,
          function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter project contained invalid value ${p}`,
            };

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity', function() {
      it('returns all times for an activity', function(done) {
        getAPIToken().then(function(token) {
          const a = 'docs';
          request.get(`${baseUrl}times?activity=${a}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.activities.indexOf(a) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('returns an error for a non-existent activity', function(done) {
        getAPIToken().then(function(token) {
          const a = 'falsch';
          request.get(`${baseUrl}times?activity=${a}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter activity contained invalid value ${a}`,
            };

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(expectedResult.status);
            expect(jsonBody).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?start=:start', function() {
      it('returns all times after a date', function(done) {
        getAPIToken().then(function(token) {
          const s = '2015-04-20';
          request.get(`${baseUrl}times?start=${s}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              // ISO dates can be compared as strings
              return t.date_worked >= s;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('returns an error for an invalid start date', function(done) {
        getAPIToken().then(function(token) {
          const s = 'faux';
          request.get(`${baseUrl}times?start=${s}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter start contained invalid value ${s}`,
            };

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(expectedResult.status);
            expect(jsonBody).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('returns an error for a future start date', function(done) {
        getAPIToken().then(function(token) {
          const s = '2105-04-19';
          request.get(`${baseUrl}times?start=${s}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter start contained invalid value ${s}`,
            };

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(expectedResult.status);
            expect(jsonBody).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?end=:end', function() {
      it('returns all times before a date', function(done) {
        getAPIToken().then(function(token) {
          const e = '2015-04-21';
          request.get(`${baseUrl}times?end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              // ISO dates can be lexically compared
              return t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('returns an error for an invalid end date', function(done) {
        getAPIToken().then(function(token) {
          const e = 'namaak';
          request.get(`${baseUrl}times?end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter end contained invalid value ${e}`,
            };

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(expectedResult.status);
            expect(jsonBody).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?start=:start&end=:end', function() {
      it('returns all times between two dates', function(done) {
        getAPIToken().then(function(token) {
          const s = '2015-04-20';
          const e = '2015-04-21';
          request.get(`${baseUrl}times?start=${s}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.date_worked >= s && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('returns an error for a start date after an end date', function(done) {
        getAPIToken().then(function(token) {
          const s = '2015-04-21';
          const e = '2015-04-19';
          request.get(`${baseUrl}times?start=${s}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);

            /*
             * This test needs to look a little different because
             * there are two possible errors that could be returned.
             */
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(400);

            expect(jsonBody.status).to.equal(400);
            expect(jsonBody.error).to.equal('Bad Query Value');

            expect([
              `Parameter end contained invalid value ${e}`,
              `Parameter start contained invalid value ${s}`,
            ]).to.include.members([jsonBody.text]);
            done();
          });
        });
      });
    });

    describe('/times?user=:pManager&user=:user2', function() {
      it('returns all times for two users', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const u2 = 'sManager';
          request.get(`${baseUrl}times?user=${u}&user=${u2}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u || t.user === u2;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&project=:project', function() {
      it('returns all times for a user and a project', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const p = 'project1';
          request.get(`${baseUrl}times?user=${u}&project=${p}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&activity=:activity', function() {
      it('returns all times for a user and an activity', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const a = 'docs';
          request.get(`${baseUrl}times?user=${u}&activity=${a}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.activities.indexOf(a) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&start=:start', function() {
      it('returns all times for a user after a date', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const s = '2015-04-20';
          request.get(`${baseUrl}times?user=${u}&start=${s}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.date_worked >= s;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&end=:end', function() {
      it('returns all times for a user before a date', function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const e = '2015-04-21';
          request.get(`${baseUrl}times?user=${u}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&start=:start&end=:end', function() {
      it('returns all times for a user between two dates', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const s = '2015-04-19';
          const e = '2015-04-20';
          request.get(`${baseUrl}times?user=${u}&start=${s}&end=${e}&` +
          `token=${token}`, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.date_worked >= s && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project1&project=:project2', function() {
      it('returns all times for two projects', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const p2 = 'project3';
          request.get(`${baseUrl}times?project=${p}&project=${p2}&token=` +
          token, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.project.indexOf(p) >= 0 || t.project.indexOf(p2) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&activity=:activity', function() {
      it('returns all times for a project and an activity', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const a = 'dev';
          request.get(`${baseUrl}times?project=${p}&activity=${a}&token=` +
          token, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.project.indexOf(p) >= 0 && t.activities.indexOf(a) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&start=:start', function() {
      it('returns all times for a project after a date', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const s = '2015-04-20';
          request.get(`${baseUrl}times?project=${p}&start=${s}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.project.indexOf(p) >= 0 && t.date_worked >= s;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&end=:end', function() {
      it('returns all times for a project before a date', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const e = '2015-04-20';
          request.get(`${baseUrl}times?project=${p}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.project.indexOf(p) >= 0 && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&start=:start&end=:end', function() {
      it('returns all times for a project between two dates', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const s = '2015-04-19';
          const e = '2015-04-21';
          request.get(`${baseUrl}times?project=${p}&start=${s}&end=${e}&` +
          `token=${token}`, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.project.indexOf(p) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity1&activity=:activity2', function() {
      it('returns all times for two activities', function(done) {
        getAPIToken().then(function(token) {
          const a = 'docs';
          const a2 = 'dev';
          request.get(`${baseUrl}times?activity=${a}&activity=${a2}&` +
          `token=${token}`, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.activities.indexOf(a) >= 0 ||
                     t.activities.indexOf(a2) >= 0;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&start=:start', function() {
      it('returns all times for an activity after a date', function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const s = '2015-04-20';
          request.get(`${baseUrl}times?activity=${a}&start=${s}&` +
          `token=${token}`, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.activities.indexOf(a) >= 0 && t.date_worked >= s;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&end=:end', function() {
      it('returns all times for an activity before a date', function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const e = '2015-04-21';
          request.get(`${baseUrl}times?activity=${a}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.activities.indexOf(a) >= 0 && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&start=:start&end=:end', function() {
      it('returns all times for an activity between two dates', function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const s = '2015-04-19';
          const e = '2015-04-21';
          request.get(`${baseUrl}times?activity=${a}&start=${s}&end=${e}&` +
          `token=${token}`, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.activities.indexOf(a) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&project=:project&activity=:activity&' +
    'start=:start&end=:end', function() {
      it('returns all times for a user, project, and activity between two ' +
      'dates', function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const p = 'project1';
          const a = 'docs';
          const s = '2015-04-20';
          const e = '2015-04-22';
          request.get(`${baseUrl}times?user=${u}&project=${p}&activity=${a}&` +
          `start=${s}&end=${e}&token=${token}`, function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0 &&
                     t.activities.indexOf(a) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:pManager&user=:user2&project=:project&' +
    'activity=:activity&start=:start&end=:end', function() {
      it('returns all times for two users, a project, and activity ' +
      'between two dates', function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const u2 = 'pManager';
          const p = 'project1';
          const a = 'docs';
          const s = '2015-04-19';
          const e = '2015-04-21';
          request.get(`${baseUrl}times?user=${u}&user=${u2}&project=${p}&` +
          `activity=${a}&start=${s}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return (t.user === u || t.user === u2) &&
                     t.project.indexOf(p) >= 0 &&
                     t.activities.indexOf(a) >= 0 &&
                     t.date_worked >= s && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&project=:project1&project=:project2&' +
    'activity=:activity&start=:start&end=:end', function() {
      it('returns all times for a user, two projects, and an ' +
      'activity between two dates', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const p = 'project1';
          const p2 = 'pdj';
          const a = 'docs';
          const s = '2015-04-19';
          const e = '2015-04-20';
          request.get(`${baseUrl}times?user=${u}&project=${p}&project=${p2}&` +
          `activity=${a}&start=${s}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && (t.project.indexOf(p) >= 0 ||
                     t.project.indexOf(p2) >= 0) &&
                     t.activities.indexOf(a) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&project=:project&activity=:activity1&' +
    'activity=:activity2&start=:start&end=:end', function() {
      it('returns all times for a user, project, and two activities ' +
      'between two dates', function(done) {
        getAPIToken().then(function(token) {
          const u = 'pManager';
          const p = 'project1';
          const a = 'docs';
          const a2 = 'dev';
          const s = '2015-04-19';
          const e = '2015-04-20';
          request.get(`${baseUrl}times?user=${u}&project=${p}&activity=${a}&` +
          `activity=${a2}&start=${s}&end=${e}&token=${token}`,
          function(err, res, body) {
            const jsonBody = JSON.parse(body);
            const expectedResults = initialData.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0 &&
              (t.activities.indexOf(a) >= 0 || t.activities.indexOf(a2) >= 0) &&
              t.date_worked >= s && t.date_worked <= e;
            });

            expect(jsonBody).to.have.length(expectedResults.length);
            for (let i = 0, len = jsonBody.length; i < len; i++) {
              expectedResults[i].project.sort();
              expectedResults[i].activities.sort();
              jsonBody[i].project.sort();
              jsonBody[i].activities.sort();
            }

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(jsonBody).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?include_deleted=true', function() {
      it('returns a list of all active and deleted times', function(done) {
        getAPIToken().then(function(token) {
          request.get(baseUrl + 'times?include_deleted=true&token=' + token,
          function(err, res, body) {
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same
              .members(initialDataWithDeleted);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&include_deleted=true', function() {
      it('returns all times for a user', function(done) {
        getAPIToken().then(function(token) {
          const user = 'admin1';
          request.get(`${baseUrl}times?user=${user}&include_deleted=true&` +
          'token=' + token, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === user;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('fails when given a nonexistent user', function(done) {
        getAPIToken().then(function(token) {
          const user = 'notauser';
          request.get(`${baseUrl}times?user=${user}&include_deleted=true&` +
          `token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter user contained invalid value ${user}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('fails when given an invalid user', function(done) {
        getAPIToken().then(function(token) {
          const user = 'wh4t3v3n.isTh%s';
          request.get(`${baseUrl}times?user=${user}&include_deleted=true&` +
          'token=' + token, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter user contained invalid value ${user}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&include_deleted=true', function() {
      it('returns all times for an activity', function(done) {
        getAPIToken().then(function(token) {
          const activity = 'dev';
          request.get(`${baseUrl}times?activity=${activity}&include_deleted=` +
          `true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(activity) >= 0;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('fails when given a nonexistent activity', function(done) {
        getAPIToken().then(function(token) {
          const activity = 'review';
          request.get(`${baseUrl}times?activity=${activity}&include_deleted=` +
          `true&token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter activity contained invalid value ${activity}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('fails when given an invalid activity', function(done) {
        getAPIToken().then(function(token) {
          const activity = 'w_hA.t';
          request.get(`${baseUrl}times?activity=${activity}&include_deleted=` +
          `true&token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter activity contained invalid value ${activity}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?project=:project?include_deleted=true', function() {
      it('returns all times for a project', function(done) {
        getAPIToken().then(function(token) {
          const project = 'project2';
          request.get(`${baseUrl}times?project=${project}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.project.indexOf(project) >= 0;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('fails when given a nonexistent project', function(done) {
        getAPIToken().then(function(token) {
          const project = 'chili';
          request.get(`${baseUrl}times?project=${project}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter project contained invalid value ${project}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('fails when given an invalid project', function(done) {
        getAPIToken().then(function(token) {
          const project = 'not@slug!';
          request.get(`${baseUrl}times?project=${project}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter project contained invalid value ${project}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?start=:start&included_deleted=true', function() {
      it('returns all times after a date', function(done) {
        getAPIToken().then(function(token) {
          const start = '2015-04-22';
          request.get(`${baseUrl}times?start=${start}&include_deleted=true&` +
          `token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.date_worked >= start;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('fails when given an invalid start date', function(done) {
        getAPIToken().then(function(token) {
          const start = 'notaday';
          request.get(`${baseUrl}times?start=${start}&include_deleted=true&` +
          `token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter start contained invalid value ${start}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('fails when given a future start date', function(done) {
        getAPIToken().then(function(token) {
          const start = '2105-04-21';
          request.get(`${baseUrl}times?start=${start}&include_deleted=true&` +
          `token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter start contained invalid value ${start}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?end=:end&include_deleted=true', function() {
      it('returns all times before a date', function(done) {
        getAPIToken().then(function(token) {
          const end = '2015-04-20';
          request.get(`${baseUrl}times?end=${end}&include_deleted=true&` +
          `token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.date_worked <= end;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });

      it('fails if given an invalid end date', function(done) {
        getAPIToken().then(function(token) {
          const end = 'theend';
          request.get(`${baseUrl}times?end=${end}&include_deleted=true&` +
          `token=${token}`, function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'Bad Query Value',
              text: `Parameter end contained invalid value ${end}`,
            };

            expect(res.statusCode).to.equal(expectedResult.status);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&activity=:activity&include_deleted=true',
    function() {
      it('returns all times that match the given user and activity',
      function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const a = 'docs';
          request.get(`${baseUrl}times?user=${u}&activity=${a}&token=${token}` +
          '&include_deleted=true', function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.activities.indexOf(a) >= 0;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&project=project&include_deleted=true',
    function() {
      it('returns all times that match the given user and project',
      function(done) {
        getAPIToken().then(function(token) {
          const u = 'sManager';
          const p = 'project2';
          request.get(`${baseUrl}times?user=${u}&project=${p}&token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&start:=start&include_deleted=true',
    function() {
      it('returns all times for a user after a date', function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const s = '2015-04-20';
          request.get(`${baseUrl}times?user=${u}&start=${s}&token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.date_worked >= s;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&end=:end&include_deleted=true',
    function() {
      it('returns all times for a user before a date', function(done) {
        getAPIToken().then(function(token) {
          const u = 'sManager';
          const e = '2015-04-22';
          request.get(`${baseUrl}times?user=${u}&end=${e}&token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&start:=start&end=:end&include_deleted=true',
    function() {
      it('returns all times for a user within a date range', function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const s = '2015-04-20';
          const e = '2015-04-25';
          request.get(`${baseUrl}times?user=${u}&start=${s}&end=${e}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.date_worked >= s && t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&activitiy=:activity&project=:project&' +
    'include_deleted=true', function() {
      it('returns all times that match the given user, activity, and project',
      function(done) {
        getAPIToken().then(function(token) {
          const u = 'sManager';
          const a = 'dev';
          const p = 'project2';
          request.get(`${baseUrl}times?user=${u}&activity=${a}&project=${p}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0 &&
                     t.activities.indexOf(a) >= 0;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&activitiy=:activity&project=:project&' +
    'start=:start&include_deleted=true', function() {
      it('returns all times that match the given parameters after a date',
      function(done) {
        getAPIToken().then(function(token) {
          const u = 'sManager';
          const a = 'dev';
          const p = 'project2';
          const s = '2015-04-22';
          request.get(`${baseUrl}times?user=${u}&activity=${a}&project=${p}&` +
          `start=${s}&include_deleted=true&token=${token}`,
          function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0 &&
                     t.activities.indexOf(a) >= 0 && t.date_worked >= s;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&activitiy=:activity&project=:project&' +
    'end=:end&include_deleted=true', function() {
      it('returns all times that match the given parameters before a date',
      function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const a = 'docs';
          const p = 'project1';
          const e = '2015-04-22';
          request.get(`${baseUrl}times?user=${u}&activity=${a}&project=${p}&` +
          `end=${e}&include_deleted=true&token=${token}`,
          function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0 &&
                     t.activities.indexOf(a) >= 0 && t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?user=:user&activitiy=:activity&project=:project&' +
    'start=:start&end=:end&include_deleted=true', function() {
      it('returns all times that match the given parameters within a date ' +
      'range', function(done) {
        getAPIToken().then(function(token) {
          const u = 'admin1';
          const a = 'docs';
          const p = 'project1';
          const s = '2015-04-19';
          const e = '2015-04-22';
          request.get(`${baseUrl}times?user=${u}&activity=${a}&project=${p}&` +
          `start=${s}&end=${e}&include_deleted=true&token=${token}`,
          function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.user === u && t.project.indexOf(p) >= 0 &&
                     t.activities.indexOf(a) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&project=:project&' +
    'include_deleted=true', function() {
      it('returns all times that match the given activity and project',
      function(done) {
        getAPIToken().then(function(token) {
          const a = 'docs';
          const p = 'project1';
          request.get(`${baseUrl}times?activity=${a}&project=${p}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.project.indexOf(p) >= 0 && t.activities.indexOf(a) >= 0;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&start=:start&include_deleted=true',
    function() {
      it('returns all times for an activity after a date', function(done) {
        getAPIToken().then(function(token) {
          const a = 'docs';
          const s = '2015-04-17';
          request.get(`${baseUrl}times?activity=${a}&start=${s}&` +
          `token=${token}&include_deleted=true`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(a) >= 0 && t.date_worked >= s;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activitiy=:activity&end=:end&include_deleted=true',
    function() {
      it('returns all times for an activity before a date', function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const e = '2015-04-25';
          request.get(`${baseUrl}times?activity=${a}&end=${e}&token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(a) >= 0 && t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activitiy=:activity&start=:start&end=:end&' +
    'include_deleted=true', function() {
      it('returns all times for an activity within a date range',
      function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const s = '2015-04-22';
          const e = '2015-04-25';
          request.get(`${baseUrl}times?activity=${a}&start=${s}&end=${e}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(a) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&start=:start&include_deleted=true',
    function() {
      it('returns all times for a project after a date', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project2';
          const s = '2015-04-20';
          request.get(`${baseUrl}times?project=${p}&start=${s}&` +
          `token=${token}&include_deleted=true`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.project.indexOf(p) >= 0 && t.date_worked >= s;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&end=:end&include_deleted=true',
    function() {
      it('returns all times for a project before a date', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const e = '2015-04-20';
          request.get(`${baseUrl}times?project=${p}&end=${e}&token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.project.indexOf(p) >= 0 && t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?project=:project&start=:start&end=:end&' +
    'include_deleted=true', function() {
      it('returns all times for a project within a date range', function(done) {
        getAPIToken().then(function(token) {
          const p = 'project1';
          const s = '2015-04-20';
          const e = '2015-04-25';
          request.get(`${baseUrl}times?project=${p}&start=${s}&end=${e}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.project.indexOf(p) >= 0 && t.date_worked >= s &&
                     t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&project=:project&start=:start&' +
    'include_deleted=true', function() {
      it('returns all times that match the given activity and project after ' +
      'a date', function(done) {
        getAPIToken().then(function(token) {
          const a = 'docs';
          const p = 'project1';
          const s = '2015-04-17';
          request.get(`${baseUrl}times?activity=${a}&project=${p}&start=${s}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(a) >= 0 &&
                     t.project.indexOf(p) >= 0 &&
                     t.date_worked >= s;
            });

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&project=:project&end=:end&' +
    'include_deleted=true', function() {
      it('returns all times that match the given activity and project before ' +
      'a date', function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const p = 'project2';
          const e = '2015-04-25';
          request.get(`${baseUrl}times?activity=${a}&project=${p}&end=${e}&` +
          `include_deleted=true&token=${token}`, function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(a) >= 0 &&
                     t.project.indexOf(p) >= 0 &&
                     t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times?activity=:activity&project=:project&start=:start&' +
    'end=:end&include_deleted=true', function() {
      it('returns all times that match the given activity and project within ' +
      'a date range', function(done) {
        getAPIToken().then(function(token) {
          const a = 'dev';
          const p = 'project2';
          const s = '2015-04-21';
          const e = '2015-04-25';
          request.get(`${baseUrl}times?activity=${a}&project=${p}&start=${s}` +
          `end=${e}&include_deleted=true&token=${token}`,
          function(err, res, body) {
            const expectedResults = initialDataWithDeleted.filter(t => {
              return t.activities.indexOf(a) >= 0 &&
                     t.project.indexOf(p) >= 0 &&
                     t.date_worked >= s && t.date_worked <= e;
            });
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
            done();
          });
        });
      });
    });

    describe('/times/:uuid', function() {
      it('returns times by uuid', function(done) {
        getAPIToken().then(function(token) {
          const uuid = '32764929-1bea-4a17-8c8a-22d7fb144941';
          request.get(`${baseUrl}times/${uuid}?token=${token}`,
          function(err, res, body) {
            const expectedResult = initialData.filter(t => {
              return t.uuid === uuid;
            })[0];
            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('fails with Object not found error', function(done) {
        getAPIToken().then(function(token) {
          const uuid = '00000000-0000-0000-0000-000000000000';
          request.get(`${baseUrl}times/${uuid}?token=${token}`,
          function(err, res, body) {
            const expectedResult = {
              error: 'Object not found',
              status: 404,
              text: 'Nonexistent time',
            };
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            expect(res.statusCode).to.equal(expectedResult.status);
            done();
          });
        });
      });

      it('fails with Invalid Identifier error', function(done) {
        getAPIToken().then(function(token) {
          const uuid = 'cat';
          request.get(`${baseUrl}times/${uuid}?token=${token}`,
          function(err, res, body) {
            const expectedResult = {
              error: 'The provided identifier was invalid',
              status: 400,
              text: 'Expected UUID but received cat',
              values: ['cat'],
            };
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            expect(res.statusCode).to.equal(expectedResult.status);
            done();
          });
        });
      });
    });

    describe('/times/:uuid?include_deleted=true', function() {
      it('returns the soft-deleted time that corresponds with the given uuid',
      function(done) {
        getAPIToken().then(function(token) {
          const uuid = 'b6ac75fb-7872-403f-ab71-e5542fae4212';
          request.get(`${baseUrl}times/${uuid}?token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResult = initialDataWithDeleted.filter(t => {
              return t.uuid === uuid;
            })[0];

            expect(err).to.equal(null);
            expect(res.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            done();
          });
        });
      });

      it('fails with Object Not Found error when given a nonexistent uuid',
      function(done) {
        getAPIToken().then(function(token) {
          const uuid = '00000000-0000-0000-0000-000000000000';
          request.get(`${baseUrl}times/${uuid}?token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResult = {
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent time',
            };

            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            expect(res.statusCode).to.equal(expectedResult.status);
            done();
          });
        });
      });

      it('fails with Invalid Identifier error when given an invalid uuid',
      function(done) {
        getAPIToken().then(function(token) {
          const uuid = 'nope';
          request.get(`${baseUrl}times/${uuid}?token=${token}&` +
          'include_deleted=true', function(err, res, body) {
            const expectedResult = {
              status: 400,
              error: 'The provided identifier was invalid',
              text: 'Expected UUID but received nope',
              values: ['nope'],
            };

            expect(JSON.parse(body)).to.deep.equal(expectedResult);
            expect(res.statusCode).to.equal(expectedResult.status);
            done();
          });
        });
      });
    });

    describe('/times/?include_revisions=true', function() {
      const currentTime = new Date().toISOString().substring(0, 10);

      const noParentsData = {
        duration: 13,
        user: 'admin1',
        project: ['p1', 'project1'],
        activities: ['docs'],
        notes: 'forgot to add last hour',
        issue_uri: 'http://example.com/project3/issues/56',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: currentTime,
        deleted_at: null,
        uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
        revision: 2,
      };

      const withParentsData = {
        duration: 13,
        user: 'admin1',
        project: ['p1', 'project1'],
        activities: ['docs'],
        notes: 'forgot to add last hour',
        issue_uri: 'http://example.com/project3/issues/56',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: currentTime,
        deleted_at: null,
        uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
        revision: 2,
        parents: [
          {
            duration: 12,
            user: 'admin1',
            project: ['p1', 'project1'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'http://example.com/project3/issues/56',
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

    describe('/times/:uuid?include_revisions=true', function() {
      const currentTime = new Date().toISOString().substring(0, 10);
      const time = 'e0326905-ef25-46a0-bacd-4391155aca4a';

      const noParentsData = {
        duration: 13,
        user: 'admin1',
        project: ['p1', 'project1'],
        activities: ['docs'],
        notes: 'forgot to add last hour',
        issue_uri: 'http://example.com/project3/issues/56',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: currentTime,
        deleted_at: null,
        uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
        revision: 2,
      };

      const withParentsData = {
        duration: 13,
        user: 'admin1',
        project: ['p1', 'project1'],
        activities: ['docs'],
        notes: 'forgot to add last hour',
        issue_uri: 'http://example.com/project3/issues/56',
        date_worked: '2015-04-20',
        created_at: '2015-04-20',
        updated_at: currentTime,
        deleted_at: null,
        uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
        revision: 2,
        parents: [
          {
            duration: 12,
            user: 'admin1',
            project: ['p1', 'project1'],
            activities: ['docs'],
            notes: '',
            issue_uri: 'http://example.com/project3/issues/56',
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
  });

  describe('POST /times', function() {
    // The time to attempt to add
    const time = {
      duration: 20,
      user: 'admin1',
      project: 'project-activity',
      activities: ['dev', 'docs'].sort(),
      notes: '',
      issue_uri: 'https://github.com/osuosl/project1/issues/1',
      date_worked: '2015-07-30',
    };

    // The time as returned from the POST endpoint
    const newTime = {
      duration: 20,
      user: 'admin1',
      project: 'project-activity',
      activities: ['docs', 'dev'].sort(),
      notes: '',
      issue_uri: 'https://github.com/osuosl/project1/issues/1',
      date_worked: '2015-07-30',
      revision: 1,
    };

    // The time as returned from the GET endpoint
    const getTime = {
      duration: 20,
      user: 'admin1',
      project: ['project-activity', 'pa'].sort(),
      activities: ['docs', 'dev'].sort(),
      notes: '',
      issue_uri: 'https://github.com/osuosl/project1/issues/1',
      date_worked: '2015-07-30',
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
      object: time,
    };

    const requestOptions = {
      url: baseUrl + 'times/',
      json: true,
      method: 'POST',
    };

    function checkListEndpoint(done, expectedResults, token) {
      request.get(`${baseUrl}times?token=${token}`, function(err, res, body) {
        expect(err).to.equal(null);
        expect(res.statusCode).to.equal(200);

        // the projects/ list shouldn't have changed
        expect(JSON.parse(body)).to.deep.have.same.members(expectedResults);
        done();
      });
    }

    it('creates a new time with activities', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedTime = copyJsonObject(newTime);
          addedTime.uuid = body.uuid;
          expect(body).to.deep.equal(addedTime);

          const expectedResult = copyJsonObject(getTime);
          expectedResult.uuid = body.uuid;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('creates a new time with default activity', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.activities;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedTime = copyJsonObject(newTime);
          addedTime.uuid = body.uuid;
          delete addedTime.activities;
          expect(body).to.deep.equal(addedTime);

          const expectedResult = copyJsonObject(getTime);
          expectedResult.uuid = body.uuid;
          expectedResult.activities = ['dev'];
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('fails with a bad token', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = 'not_a_token';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Authentication failure',
            status: 401,
            text: 'Bad API token',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it("fails when user isn't member of project", function(done) {
      getAPIToken('user1', 'passing').then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.user = 'user1';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Authorization failure',
            status: 401,
            text: 'user1 is not authorized to create time entries for ' +
                  'project project-activity.',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          getAPIToken().then(function(newToken) {
            checkListEndpoint(done, initialData, newToken);
          });
        });
      });
    });

    it('fails with a missing token', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        delete requestOptions.body.auth.token;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Authentication failure',
            status: 401,
            text: 'Missing credentials',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a negative duration', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.duration = -20;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field duration of time should be positive number but was ' +
                  'sent as negative number',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-numeric duration', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.duration = 'number';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field duration of time should be number but was sent as ' +
                  'string',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a missing duration', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.duration;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a duration',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a bad activity', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.activities.push('activity_!@#');

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field activities of time should be slugs but was sent as ' +
                  'array containing at least 1 invalid slug',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-existent activity', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.activities.push('dancing');

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Invalid foreign key',
            status: 409,
            text: 'The time does not contain a valid activities reference.',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-string activity', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.activities.push(-14);

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field activities of time should be slugs but was sent as ' +
                  'array containing at least 1 number',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-array activities', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.activities = -1.414141414;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field activities of time should be array but was sent as ' +
                  'number',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with missing activities', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.project = 'project1';
        delete requestOptions.body.object.activities;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a activities',
          };

          expect(err).to.equal(null);
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a bad project', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        const project = 'project? we need a project?';
        requestOptions.body.object.project = project;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field project of time should be slug but was sent as ' +
                  `invalid slug ${project}`,
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-existent project', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.project = 'not-a-project';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Invalid foreign key',
            status: 409,
            text: 'The time does not contain a valid project reference.',
          };

          expect(err).to.equal(null);
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-string project', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.project = ['who needs', 'proper types'];

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field project of time should be string but was sent as ' +
                  'array',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a missing project', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.project;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a project',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a bad issue URI', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        const uri = 'we need no uri';
        requestOptions.body.object.issue_uri = uri;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field issue_uri of time should be URI but was sent as ' +
                  `invalid URI ${uri}`,
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-string issue URI', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.issue_uri = [12, 34];

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field issue_uri of time should be string but was sent as ' +
                  'array',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('works with a missing issue URI', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.issue_uri;

        request.post(requestOptions, function(err, res, body) {
          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(200);

          const addedTime = copyJsonObject(newTime);
          addedTime.uuid = body.uuid;
          delete addedTime.issue_uri;
          expect(body).to.deep.equal(addedTime);

          const expectedResult = copyJsonObject(getTime);
          expectedResult.uuid = body.uuid;
          expectedResult.issue_uri = null;
          checkListEndpoint(done, initialData.concat(expectedResult), token);
        });
      });
    });

    it('fails with a bad user', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.user = 'notauser';

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Authorization failure',
            status: 401,
            text: `${defaultUsername} is not authorized to create time ` +
                  `entries for ${requestOptions.body.object.user}`,
          };

          expect(err).to.equal(null);
          expect(body).to.deep.equal(expectedResult);
          expect(res.statusCode).to.equal(expectedResult.status);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-string user', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.user = {username: 'admin1'};

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field user of time should be string but was sent as ' +
                  'object',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a missing user', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.user;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a user',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a bad date worked', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        const date = 'baaaaaaaad';
        requestOptions.body.object.date_worked = date;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field date_worked of time should be ISO-8601 date but was ' +
                  `sent as ${date}`,
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a non-string date worked', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        requestOptions.body.object.date_worked = 1234;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'Field date_worked of time should be string but was sent ' +
                  `as number`,
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });

    it('fails with a missing date worked', function(done) {
      getAPIToken().then(function(token) {
        requestOptions.body = copyJsonObject(postArg);

        requestOptions.body.auth.token = token;
        delete requestOptions.body.object.date_worked;

        request.post(requestOptions, function(err, res, body) {
          const expectedResult = {
            error: 'Bad object',
            status: 400,
            text: 'The time is missing a date_worked',
          };

          expect(err).to.equal(null);
          expect(res.statusCode).to.equal(expectedResult.status);
          expect(body).to.deep.equal(expectedResult);

          checkListEndpoint(done, initialData, token);
        });
      });
    });
  });

  describe('POST /times/:uuid', function() {
    // The database's entry for `Project3`'s time entry
    const postOriginalTime = {
      duration: 12,
      user: 'pManager',
      project: ['p1', 'project1'],
      notes: '',
      activities: ['dev', 'docs'],
      issue_uri: 'http://example.com/project3/issues/56',
      date_worked: '2015-04-20',
      uuid: 'e0326905-ef25-46a0-bacd-4391155aca4a',
      revision: 1,
    };

    const getOriginalTime = {
      duration: 12,
      user: 'pManager',
      project: ['p1', 'project1'],
      activities: ['dev', 'docs'],
      notes: '',
      issue_uri: 'http://example.com/project3/issues/56',
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
      project: 'project2',
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/project2/pull/19',
      date_worked: '2015-04-28',
    };

    const getPatchedTime = {
      duration: 15,
      user: 'pManager',
      project: ['project2'],
      activities: ['docs', 'sys'],
      notes: 'Now this is a note',
      issue_uri: 'https://github.com/osuosl/project2/pull/19',
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
      pManager: 'validusername',
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
      expectedResults.project = ['project2'];
      let error;
      const statusCode = 200;

      checkPostToEndpoint(done, null, postObj, expectedResults, error,
                 statusCode, undefined, 'pManager', 'pass');
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
      expectedResults.project = ['project2'];
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
      const error = {
        status: 404,
        error: 'Object not found',
        text: 'Nonexistent time',
      };

      checkPostToEndpoint(done, uri, postObj, expectedResults, error.error,
                 error.status, [error]);
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
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field duration of time should be ' +
            'number but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests invalid project field
    it('unsuccessfully patches time with just invalid project datatype',
    function(done) {
      const postObj = {project: invalidTimeDataType.project};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field project of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests invalid activities field
    it('unsuccessfully patches time with just invalid activites datatype',
    function(done) {
      const postObj = {activities: invalidTimeDataType.activities};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field activities of time should be ' +
            'array but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests invalid notes field
    it('unsuccessfully patches time with just invalid notes datatype',
    function(done) {
      const postObj = {notes: invalidTimeDataType.notes};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field notes of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests invalid issue_uri field
    it('unsuccessfully patches time with just invalid issue_uri datatype',
    function(done) {
      const postObj = {issue_uri: invalidTimeDataType.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field issue_uri of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests invalid date_worked field
    it('unsuccessfully patches time with just invalid date_worked datatype',
    function(done) {
      const postObj = {date_worked: invalidTimeDataType.date_worked};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field date_worked of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests invalid key field
    it('unsuccessfully patches time with just invalid key datatype',
    function(done) {
      const postObj = {key: invalidTimeDataType.key};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'time does not have a key field',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid duration
    it('unsuccessfully patches time with an invalid duration datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.duration = invalidTimeDataType.duration;
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field duration of time should be ' +
            'number but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid project
    it('unsuccessfully patches time with an invalid project datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.project = invalidTimeDataType.project;
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field project of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid activities
    it('unsuccessfully patches time with an invalid activities datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.activities = invalidTimeDataType.activities;
      postObj.project = 'project1';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field activities of time should be ' +
            'array but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid notes
    it('unsuccessfully patches time with an invalid notes datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.notes = invalidTimeDataType.notes;
      postObj.project = 'project1';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field notes of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid issue_uri
    it('unsuccessfully patches time with an invalid issue_uri datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.issue_uri = invalidTimeDataType.issue_uri;
      postObj.project = 'project1';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field issue_uri of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid date_worked
    it('unsuccessfully patches time with an invalid date_worked datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.date_worked = invalidTimeDataType.date_worked;
      postObj.project = 'project1';
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field date_worked of time should be ' +
            'string but was sent as object',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Tests all valid fields except invalid key
    it('unsuccessfully patches time with an invalid key datatype',
    function(done) {
      const postObj = copyJsonObject(postOriginalTime);
      postObj.key = invalidTimeDataType.key;
      delete postObj.uuid;
      delete postObj.revision;

      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'time does not have a key field',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
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
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field duration of time should be positive integer but ' +
            'was sent as negative integer',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Test invalid project foreign key
    it('unsuccessfully patches time with just invalid project foreign key',
    function(done) {
      const postObj = {project: invalidTimeValue.project1};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 409,
        error: 'Invalid foreign key',
        text: 'The time does not contain a valid project reference.',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Test invalid project (inavlid formatting)
    it('unsuccessfully patches time with just invalid project string',
    function(done) {
      const postObj = {project: invalidTimeValue.project2};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 409,
        error: 'Invalid foreign key',
        text: 'The time does not contain a valid project reference.',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Test invalid activities (not in the database)
    it('unsuccessfully patches time with just invalid activities foreign ' +
       'key',
    function(done) {
      const postObj = {activities: invalidTimeValue.activities1};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 409,
        error: 'Invalid foreign key',
        text: 'The time does not contain a valid activities reference.',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Test invalid activities (invalid formatting)
    it('unsuccessfully patches time with just invalid activities string',
    function(done) {
      const postObj = {user: invalidTimeValue.activities2};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field user of time should be string but was sent as array',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Test bad issue uri (formatting)
    it('unsuccessfully patches time with just invalid issue_uri',
    function(done) {
      const postObj = {issue_uri: invalidTimeValue.issue_uri};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field issue_uri of time should be URI but was sent ' +
            'as invalid URI git@github.com:osuosl',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });

    // Test bad date (formatting)
    it('unsuccessfully patches time with just invalid date_worked',
    function(done) {
      const postObj = {date_worked: invalidTimeValue.date_worked};
      const expectedResults = copyJsonObject(getOriginalTime);
      const error = {
        status: 400,
        error: 'Bad object',
        text: 'Field date_worked of time should be ISO-8601 date but was ' +
                'sent as April 29, 1995',
      };

      checkPostToEndpoint(done, null, postObj, expectedResults, error.error,
                 error.status, [error]);
    });
  });

  describe('DELETE /times/:uuid', function() {
    it('deletes the object with a valid uuid by an admin', function(done) {
      getAPIToken().then(function(token) {
        const uuid = '32764929-1bea-4a17-8c8a-22d7fb144941';
        request.del(`${baseUrl}times/${uuid}?token=${token}`,
        function(err, res, body) {
          expect(body.error).to.equal(undefined);
          expect(res.statusCode).to.equal(200);

          request.get(`${baseUrl}times/${uuid}?token=${token}`,
          function(err0, res0, body0) {
            expect(JSON.parse(body0)).to.deep.equal({
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent time',
            });
            expect(res0.statusCode).to.equal(404);
            done();
          });
        });
      });
    });

    it('deletes the object with a valid uuid by the user', function(done) {
      getAPIToken('pManager', 'pass').then(function(token) {
        const uuid = '32764929-1bea-4a17-8c8a-22d7fb144941';
        request.del(`${baseUrl}times/${uuid}?token=${token}`,
        function(err, res, body) {
          expect(body.error).to.equal(undefined);
          expect(res.statusCode).to.equal(200);

          request.get(`${baseUrl}times/${uuid}?token=${token}`,
          function(err0, res0, body0) {
            expect(res0.statusCode).to.equal(404);
            expect(JSON.parse(body0)).to.deep.equal({
              status: 404,
              error: 'Object not found',
              text: 'Nonexistent time',
            });
            done();
          });
        });
      });
    });

    it('fails to delete the object with a non-existent uuid', function(done) {
      getAPIToken().then(function(token) {
        const uuid = '66666666-6666-6666-6666-666666666666';
        request.del(`${baseUrl}times/${uuid}?token=${token}`,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal({
            status: 404,
            error: 'Object not found',
            text: 'Nonexistent uuid',
          });
          expect(res.statusCode).to.equal(404);

          request.get(`${baseUrl}times?token=${token}`,
          function(err0, res0, body0) {
            expect(err0).to.equal(null);
            expect(JSON.parse(body0)).to.deep.have.same.members(initialData);
            expect(res0.statusCode).to.equal(200);
            done();
          });
        });
      });
    });

    it('fails to delete the object with an invalid uuid', function(done) {
      getAPIToken().then(function(token) {
        const uuid = 'myuuid';
        request.del(`${baseUrl}times/${uuid}?token=${token}`,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal({
            'status': 400,
            'error': 'The provided identifier was invalid',
            'text': 'Expected uuid but received myuuid',
            'values': ['myuuid'],
          });
          expect(res.statusCode).to.equal(400);

          request.get(`${baseUrl}times?token=${token}`,
          function(err0, res0, body0) {
            expect(err0).to.equal(null);
            expect(JSON.parse(body0)).to.deep.have.same.members(initialData);
            expect(res0.statusCode).to.equal(200);
            done();
          });
        });
      });
    });

    it('fails to delete the object with invalid permissions', function(done) {
      getAPIToken('sSpectator', 'word').then(function(token) {
        const uuid = '32764929-1bea-4a17-8c8a-22d7fb144941';
        request.del(`${baseUrl}times/${uuid}?token=${token}`,
        function(err, res, body) {
          expect(JSON.parse(body)).to.deep.equal({
            'status': 401,
            'error': 'Authorization failure',
            'text': 'sSpectator is not authorized to delete time ' +
              '32764929-1bea-4a17-8c8a-22d7fb144941',
          });
          expect(res.statusCode).to.equal(401);

          request.get(`${baseUrl}times/${uuid}?token=${token}`,
          function(getErr, getRes, getBody) {
            expect(getErr).to.equal(null);
            expect(JSON.parse(getBody)).to.deep.equal(initialData.filter(t => {
              return t.uuid === uuid;
            })[0]);
            expect(getRes.statusCode).to.equal(200);

            request.get(`${baseUrl}times?token=${token}`,
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
