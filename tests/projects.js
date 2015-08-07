function copyJsonObject(obj) {
    // This allows us to change object properties
    // without effecting other tests
    return JSON.parse(JSON.stringify(obj));
}

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
                    text: 'Expected slug but received test-!*@',
                    values: ['test-!*@']
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });

    // Tests Patching Projects
    // Test that a valid uri, slugs, owner, and name succesfully patches
    //      the project.
    // Test that valid uri succesfully patches the project.
    // Test that valid slugs succesfully patches the project.
    // Test that valid name succesfully patches the project.
    // Test that valid owner succesfully patches the project.
    // Test that all invalid elements unsucessfully patches the project.
    // Test that all but valid uri unsuccesfully patches the project.
    // Test that all but valid slugs unsuccesfully patches the project.
    // Test that all but valid name unsuccesfully patches the project.
    // Test that all but valid owner unsuccesfully patches the project.
    // Test that all but invalid key unsuccesfully patches the project.
    // Test that invalid uri unsuccesfully patches the project.
    // Test that invalid slugs unsuccesfully patches the project.
    // Test that invalid name unsuccesfully patches the project.
    // Test that invalid owner unsuccesfully patches the project.
    // Test that invalid key unsuccesfully patches the project.
    describe('POST /projects/:slug', function() {

        var patchedProject = {
            name: 'Ganeti Web Mgr',
            owner: 'tschuy',
            slugs: ['gwm', 'gan-web'],
            uri: 'https://code.osuosl.org/projects/',
        };

        var originalProject = {
            id: 1,
            name: 'Ganeti Web Manager',
            owner: 'tschuy',
            slugs: ['gwm', 'ganeti-webmgr'],
            uri: 'https://code.osuosl.org/projects/ganeti-webmgr'
        };

        var patchedProjectName  = {name:  patchedProject.name };
        var patchedProjectOwner = {owner: patchedProject.owner};
        var patchedProjectUri   = {uri:   patchedProject.uri  };
        var patchedProjectSlugs = {slugs: patchedProject.slugs};

        var badProject = {
            name:  ['a name'],
            owner: ['a owner'],
            uri:   ['a website'],
            slugs: '',
            key:   'value'
        };

        var badProjectName  = {name:  badProject.name };
        var badProjectOwner = {Owner: badProject.owner};
        var badProjectUri   = {uri:   badProject.uri  };
        var badProjectSlugs = {slugs: badProject.slugs};
        var badProjectKey   = {key:   'value'         };

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

        // Function used for validating that the object in the database
        // is in the correct state (change or unchanged based on if the POST
        // was valid)
        var checkListEndpoint = function(done, expectedResults) {
            // Make a get request
            request.get(requestOptions.url, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                body = JSON.parse(body);
                expect(body).to.deep.equal(expectedResults);
                done();
            });
        };

        it("successfully patches a project's uri, slugs, owner, and name",
           function(done) {
            postArg.object = copyJsonObject(patchedProject);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                // Set expected results to the new state of the project gwm
                var expectedResults = copyJsonObject(originalProject);
                expectedResults.name = patchedProject.name;
                expectedResults.uri = patchedProject.uri;
                expectedResults.slugs = patchedProject.slugs;
                expectedResults.owner = patchedProject.owner;

                // expect body of post request to be the new state of gwm
                expect(body).to.deep.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("successfully patches a project's uri", function(done) {
            postArg.object = copyJsonObject(patchedProjectUri);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = copyJsonObject(originalProject);
                expectedResults.uri = patchedProject.uri;

                expect(body).to.deep.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("successfully patches a project's slugs", function(done) {
            postArg.object = copyJsonObject(patchedProjectSlugs);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = copyJsonObject(originalProject);
                expectedResults.slugs = patchedProject.slugs;

                expect(body).to.deep.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("successfully patches a project's name", function(done) {
            postArg.object = copyJsonObject(patchedProjectName);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = copyJsonObject(originalProject);
                expectedResults.name = patchedProject.name;

                body = JSON.parse(body);

                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("successfully patches a project's owner", function(done) {
            postArg.object = copyJsonObject(patchedProjectOwner);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                var expectedResults = copyJsonObject(originalProject);
                expectedResults.owner = patchedProject.owner;

                body = JSON.parse(body);

                expect(body).to.equal(expectedResults);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with bad uri, name, slugs, and and owner",
           function(done) {
            postArg.object = copyJsonObject(badProject);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect([
                'Field uri of project should be string but was sent array',
                'Field names of project should be string but was sent array',
                'Field owner of project should be string but was sent array',
                'Field slugs of project should be array but was sent string',
                'project does not have a key fieldname'
                ]).to.include.members([JSON.parse(body).text]);

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with only bad uri", function(done) {
            postArg.object = copyJsonObject(badProjectUri);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field uri of project' +
                    'should be string but was sent as array');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with only bad slugs", function(done) {
            postArg.object.slugs = copyJsonObject(badProjectSlugs);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field slugs of' +
                    ' project should be array but was sent as string');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with only bad name", function(done) {
            postArg.object = copyJsonObject(badProjectName);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field name of' +
                    ' project should be string but was sent as array');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with just bad owner", function(done) {
            postArg.object = copyJsonObject(badProjectOwner);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field owner of' +
                    ' project should be string but was sent as array');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with just invalid key", function(done) {
            postArg.object = copyJsonObject(badProjectKey);
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('project does not' +
                    ' have a key fieldname');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with invalid uri", function(done) {
            postArg.form = copyJsonObject(originalProject);
            postArg.form.uri = badProject.uri;
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field uri of project' +
                    ' should be string but was sent as array');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with invalid slugs", function(done) {
            postArg.object = copyJsonObject(originalProject);
            postArg.object.slugs = badProject.slugs;
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field slugs of' +
                    ' project should be array but was sent as string');

                var expectedResults = copyJsonObject(originalProject);

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with invalid name", function(done) {
            postArg.form = copyJsonObject(originalProject);
            postArg.form.name = badProject.name;
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field name of' +
                    ' project should be string but was sent as array');

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with invalid owner", function(done) {
            postArg.form = copyJsonObject(originalProject);
            postArg.form.owner = badProject.owner;
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad object');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('Field owner of' +
                    ' project should be string but was sent as array');

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

        it("doesn't patch a project with invalid key", function(done) {
            postArg.form = copyJsonObject(originalProject);
            postArg.form.key = badProject.key;
            requestOptions.form = copyJsonObject(postArg);

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.equal('Bad Foreign Key');
                expect(res.statusCode).to.equal(400);
                expect(JSON.parse(body).text).to.equal('project does not' +
                    'have a key fieldname');

                var expectedResults = originalProject;

                checkListEndpoint(done, expectedResults);
            });
        });

    });

    describe('POST /projects', function() {
        // the project object to attempt to add
        var project = {
            uri: 'https://github.com/osuosl/timesync-node',
            owner: 'tschuy',
            slugs: ['ts', 'timesync'],
            name: 'TimeSync Node'
        };

        // the project as added to the database
        var newProject = {
            uri: 'https://github.com/osuosl/timesync-node',
            owner: 'tschuy',
            slugs: ['ts', 'timesync'],
            name: 'TimeSync Node',
            id: 4
        };

        // the base POST JSON
        var postArg = {
            auth: {
                user: 'tschuy',
                password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                          'PvSG8rwN4xyaF5W'
            },
            object: project
        };

        var initialProjects = [
            {
                uri: 'https://code.osuosl.org/projects/' +
                    'ganeti-webmgr',
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

        var requestOptions = {
            url: baseUrl + 'projects/',
            json: true,
            method: 'POST'
        };

        it('successfully creates a new project with slugs', function(done) {
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);
                expect(body).to.deep.equal(newProject);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    // the projects/ endpoint should now have one more project
                    var expectedResults = initialProjects.concat([newProject]);

                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    expect(JSON.parse(body))
                    .to.have.same.deep.members(expectedResults);
                    done();
                });
            });
        });

        it('successfully creates a new project with no uri', function(done) {
            // remove uri from post data
            var postNoUri = copyJsonObject(postArg);
            postNoUri.object.uri = undefined;
            requestOptions.form = postNoUri;

            // remove uri from test object
            var newProjectNoUri = copyJsonObject(newProject);
            delete newProjectNoUri.uri;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                expect(body).to.deep.equal(newProjectNoUri);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    // the projects/ endpoint should now have one more project
                    var expectedResults = initialProjects.concat([
                          {
                              owner: 'tschuy',
                              uri: null,
                              slugs: ['ts', 'timesync'],
                              name: 'TimeSync Node',
                              id: 4
                          }
                    ]);

                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    expect(body).to.deep.have.same.members(expectedResults);
                    done();
                });
            });
        });

        it('fails to create a new project with an invalid uri', function(done) {
            var postInvalidUri = copyJsonObject(postArg);
            postInvalidUri.object.uri = "Ceci n'est pas un url";
            requestOptions.form = postInvalidUri;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: "Expected uri but received Ceci n'est pas un url",
                    values: ["Ceci n'est pas un url"]
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    // the projects/ list shouldn't have changed
                    expect(body).to.deep.have.same.members(initialProjects);
                    done();
                });
            });
        });

        it('fails to create a new project with an invalid slug',
        function(done) {
            var postInvalidSlug = copyJsonObject(postArg);
            // of these slugs, only 'dog' is valid
            postInvalidSlug.object.slugs = ['$*#*cat', 'dog', ')_!@#mouse'];
            requestOptions.form = postInvalidSlug;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: 'Expected slug but received: $*#*cat, )_!@#mouse',
                    values: ['$*#*cat', ')_!@#mouse']
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    // the projects/ list shouldn't have changed
                    expect(body).to.deep.have.same.members(initialProjects);
                    done();
                });
            });
        });

        it('fails to create a new project with an existing slug',
        function(done) {
            var postExistingSlug = copyJsonObject(postArg);
            postExistingSlug.object.slugs = ['gwm', 'ganeti-webmgr', 'dog'];
            requestOptions.form = postExistingSlug;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 409,
                    error: 'The slug provided already exists',
                    text: 'slugs ganeti-webmgr, gwm already exist',
                    values: ['ganeti-webmgr', 'gwm']
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(409);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    // the projects/ list shouldn't have changed
                    expect(body).to.deep.have.same.members(initialProjects);
                    done();
                });
            });
        });

        it('fails to create a new project with no slugs', function(done) {
            var postNoSlug = copyJsonObject(postArg);
            postNoSlug.object.slugs = undefined;
            requestOptions.form = postNoSlug;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'The project is missing a slug'
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    // the projects/ list shouldn't have changed
                    expect(body).to.deep.have.same.members(initialProjects);
                    done();
                });
            });
        });

        it('fails to create a new project with no name', function(done) {
            var postNoName = copyJsonObject(postArg);
            postNoName.object.name = undefined;
            requestOptions.form = postNoName;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 400,
                    error: 'Bad object',
                    text: 'The project is missing a name'
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    // the projects/ list shouldn't have changed
                    expect(body).to.deep.have.same.members(initialProjects);
                    done();
                });
            });
        });

        it('fails to create a new project with an owner different from auth',
        function(done) {
            var postOtherOwner = copyJsonObject(postArg);
            postOtherOwner.object.owner = 'deanj';
            requestOptions.form = postOtherOwner;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 401,
                    error: 'Authorization failure',
                    text: 'tschuy is not authorized to create objects for deanj'
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(401);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    // the projects/ list shouldn't have changed
                    expect(body).to.deep.have.same.members(initialProjects);
                    done();
                });
            });
        });
    });

};
