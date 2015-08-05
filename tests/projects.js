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
                    text: 'Expected slug but received test-!*@'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
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
            json: true
        };

        it('successfully creates a new project with slugs', function(done) {
            requestOptions.form = postArg;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                expect(body).to.equal(newProject);

                request.get(baseUrl + 'projects', function(err, res, body) {
                    // the projects/ endpoint should now have one more project
                    var expectedResults = initialProjects.concat([newProject]);

                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);

                    body = JSON.parse(body);
                    expect(body).to.deep.have.same.members(expectedResults);
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
            var newProjectNoUri = copyJsonObject(postArg);
            delete newProjectNoUri.uri;

            request.post(requestOptions, function(err, res, body) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                expect(body).to.equal(newProject);

                currentTime = Date.now().getTime() / 1000;

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
                    text: "expected uri but receieved Ceci n'est pas un url"
                };

                expect(JSON.parse(body)).to.deep.equal(expectedError);
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
                    text: 'expected slug but receieved: $*#*cat, )_!@#mouse'
                };

                expect(JSON.parse(body)).to.deep.equal(expectedError);
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
            postExistingSlug.object.slugs = ['gwm', 'dog'];
            requestOptions.form = postExistingSlug;

            request.post(requestOptions, function(err, res, body) {
                var expectedError = {
                    status: 409,
                    error: 'The slug provided already exists',
                    text: 'slug gwm already exists'
                };

                expect(JSON.parse(body)).to.deep.equal(expectedError);
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

                expect(JSON.parse(body)).to.deep.equal(expectedError);
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

                expect(JSON.parse(body)).to.deep.equal(expectedError);
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

                expect(JSON.parse(body)).to.deep.equal(expectedError);
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
