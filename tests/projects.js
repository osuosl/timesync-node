module.exports = function(expect, request, baseUrl) {
    /* GET one of the /projects endpoints and check its response against
       what should be returned */
    describe('GET /projects', function() {
        it('should return all projects in the database', function(done) {
            request.get(baseUrl + 'projects', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResults = [
                    {
                        uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
                        name: 'Ganeti Web Manager',
                        slugs: ['gwm', 'ganeti-webmgr'],
                        owner: 'tschuy',
                        id: 1
                    },
                    {
                        uri: 'https://code.osuosl.org/projects/pgd',
                        name: 'Protein Geometry Database',
                        slugs: ['pgd'],
                        owner: 'deanj',
                        id: 2
                    },
                    {
                        uri: 'https://github.com/osu-cass/whats-fresh-api',
                        name: 'Whats Fresh',
                        slugs: ['wf'],
                        owner: 'tschuy',
                        id: 3
                    }
                ];

                [expectedResults, jsonBody].forEach(function(list) {
                    list.forEach(function(result) {
                        result.slugs.sort();
                    });
                });

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                expect(jsonBody).to.deep.equal(expectedResults);
                done();
            });
        });
    });

    describe('GET /projects/:slug', function() {
        it('should return projects by slug', function(done) {
            request.get(baseUrl + 'projects/gwm', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
                    name: 'Ganeti Web Manager',
                    slugs: ['gwm', 'ganeti-webmgr'],
                    owner: 'tschuy',
                    id: 1
                };
                expectedResult.slugs.sort();
                jsonBody.slugs.sort();

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                expect(jsonBody).to.deep.equal(expectedResult);
                done();
            });
        });

        it('should fail with invalid slug error', function(done) {
            request.get(baseUrl + 'projects/404', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent project'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });

        it('should fail with Invalid Slug error', function(done) {
            request.get(baseUrl + 'projects/test-!*@',
                    function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: 'Expected slug but received test-!*@'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });

    // Tests Patching Projects
        // Test that a valid URI, slugs, owner, and name succesfully patches
        //      the project.
        // Test that valid URI succesfully patches the project.
        // Test that valid slugs succesfully patches the project.
        // Test that valid name succesfully patches the project.
        // Test that valid owner succesfully patches the project.
        // Test that all invalid elements unsucessfully patches the project.
        // Test that all but valid URI unsuccesfully patches the project.
        // Test that all but valid slugs unsuccesfully patches the project.
        // Test that all but valid name unsuccesfully patches the project.
        // Test that all but valid owner unsuccesfully patches the project.
        // Test that all but invalid key unsuccesfully patches the project.
        // Test that invalid URI unsuccesfully patches the project.
        // Test that invalid slugs unsuccesfully patches the project.
    describe('POST /projects/:slug', function() {

        var patchedProject = {
            name: 'Ganeti Web Mgr',
            owner: 'voigte',
            slugs: [ 'gwm', 'gan-web' ],
            uri: 'https://code.osuosl.org/projects/',
        };

        var originalProject = {
            id: 1,
            name: 'Ganeti Web Manager',
            owner: 'tschuy',
            slugs: ['gwm', 'ganeti-webmgr'],
            uri: 'https://code.osuosl.org/projects/'
        };

        var patchedProjectName  = {name:  patchedProject.name };
        var patchedProjectOwner = {owner: patchedProject.owner};
        var patchedProjectUri   = {uri:   patchedProject.uri  };
        var patchedProjectSlugs = {slugs: patchedProject.slugs};

        var badProject = {
            name: '',
            owner: '',
            uri: 'mywebsite',
            slugs: [ ]
        };

        var badProjectName    = {name:  badProject.name };
        var badProjectOwner   = {Owner: badProject.owner};
        var badProjectUri     = {uri:   badProject.uri  };
        var badProjectSlugs   = {slugs: badProject.slugs};
        var badProjectInvalid = {key:   'value'         };

        var postArg = {
            auth: {
                user: 'tschuy',
                password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                          'PvSG8rwN4xyaF5W'
            },
        };

        var requestOptions = {
            url: baseUrl + 'projects/gwm',
            json: true
        };

        var checkListEndpoint = function(done, expectedResults) {
            // Make a get request
            request.get(requestOptions.url, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                body = JSON.parse(body);
                expect(body).to.equal(expectedResults);
                done();
            });
        };

        it('successfully patches a projects URI, slugs, owner, and name',
           function(done) {
            postArg.object = patchedProject;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                // Set expected results to the new state of
                var expectedResults = originalProject;
                expectedResults.name = patchedProject.name;
                expectedResults.uri = patchedProject.uri;
                expectedResults.slugs = patchedProject.slugs;
                expectedResults.owner = patchedProject.owner;

                body = JSON.parse(body);

                // expect body of post request to be the new state of gwm
                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it('successfully patches a projects URI', function(done) {
            postArg.object = patchedProjectUri;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = originalProject;
                expectedResults.uri = patchedProject.uri;

                body = JSON.parse(body);

                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it('successfully patches a projects slugs', function(done) {
            postArg.object = patchedProjectSlugs;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = originalProject;
                expectedResults.slugs = patchedProject.slugs;

                body = JSON.parse(body);

                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it('successfully patches a projects name', function(done) {
            postArg.object = patchedProjectName;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = originalProject;
                expectedResults.name = patchedProject.name;

                body = JSON.parse(body);

                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it('successfully patches a projects owner', function(done) {
            postArg.object = patchedProjectOwner;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = originalProject;
                expectedResults.owner = patchedProject.owner;

                body = JSON.parse(body);

                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patches a project bad uri, name, slugs, and and owner',
           function(done) {
            postArg.object = badProject;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400)
                // This should also test for the test in the body of the
                // response.

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with just a bad uri', function(done) {
            postArg.object = badProjectUri;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400)

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with just bad slugs', function(done) {
            postArg.object = badProjectSlugs;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with just bad name', function(done) {
            postArg.object = badProjectName;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with just bad owner', function(done) {
            postArg.object = badProjectOwner;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with invalid key', function(done) {
            postArg.object = badProjectOwner;
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Invalid foreign key');
                expect(res.statusCode).to.equal(409);

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with invalid uri', function(done) {
            requestOptions.form = badProjectUri;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it('doesnt patch a project with invalid slugs', function(done) {
            requestOptions.form = badProjectSlugs;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        // Test that invalid name unsuccesfully patches the project.

        // Test that invalid owner unsuccesfully patches the project.

        // Test that invalid key unsuccesfully patches the project.

    });
};
