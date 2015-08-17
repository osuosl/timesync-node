module.exports = function(expect, request, baseUrl) {
    /* GET one of the /activities endpoints and check its response against
       what should be returned */
    describe('GET /activities', function() {
        it('should return all activities in the database', function(done) {
            request.get(baseUrl + 'activities', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResults = [
                    {
                        name: 'Documentation',
                        slug: 'docs',
                        id: 1
                    },
                    {
                        name: 'Development',
                        slug: 'dev',
                        id: 2
                    },
                    {
                        name: 'Systems',
                        slug: 'sys',
                        id: 3
                    }
                ];

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);
                expect(jsonBody).to.deep.equal(expectedResults);
                done();
            });
        });
    });

    describe('GET /activities/:slug', function() {
        it('should return activities by slug', function(done) {
            request.get(baseUrl + 'activities/sys', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    name: 'Systems',
                    slug: 'sys',
                    id: 3
                };

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                expect(jsonBody).to.deep.equal(expectedResult);
                done();
            });
        });

        it('should fail with invalid slug error', function(done) {
            request.get(baseUrl + 'activities/404', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent activity'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });

        it('should fail with Invalid Slug error', function(done) {
            request.get(baseUrl + 'activities/test-!*@',
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

    describe('DELETE /activities/:slug', function() {
        it('deletes the activity affiliated with the activity slug',
        function(done) {
            request.del(baseUrl + 'activities/sys', function(err, res) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                // Checks to see that the activity has been deleted from the db
                request.get(baseUrl + 'activities/sys',
                function(err, res, body) {
                    var jsonBody = JSON.parse(body);
                    var expectedError = {
                        status: 404,
                        error: 'Object not found',
                        text: 'Nonexistent activity'
                    };

                    expect(jsonBody).to.deep.equal(expectedError);
                    expect(res.statusCode).to.equal(404);

                    done();
                });
            });
        });

        it('fails if it receives a nonexistent slug', function(done) {
            request.del(baseUrl + 'activities/naps', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent slug'
                };

                expect(jsonBody).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(404);

                request.get(baseUrl + 'activities', function(err, res, body) {
                    var jsBody = JSON.parse(body);
                    var expectedResult = [
                        {
                            name: 'Documentation',
                            slug: 'docs',
                            id: 1
                        },
                        {
                            name: 'Development',
                            slug: 'dev',
                            id: 2
                        },
                        {
                            name: 'Systems',
                            slug: 'sys',
                            id: 3
                        }
                    ];

                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);
                    expect(jsBody).to.deep.have.same.members(expectedResult);

                    done();
                });
            });
        });

        it('fails if it receives an invalid slug', function(done) {
            request.del(baseUrl + 'activities/!what',
            function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: 'Expected slug but received !what',
                    values: ['!what']
                };

                expect(jsonBody).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'activities', function(err, res, body) {
                    var jsBody = JSON.parse(body);
                    var expectedResult = [
                        {
                            name: 'Documentation',
                            slug: 'docs',
                            id: 1
                        },
                        {
                            name: 'Development',
                            slug: 'dev',
                            id: 2
                        },
                        {
                            name: 'Systems',
                            slug: 'sys',
                            id: 3
                        }
                    ];

                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);
                    expect(jsBody).to.deep.have.same.members(expectedResult);

                    done();
                });
            });
        });

        it('fails if the activity is referenced by timesactivities',
        function(done) {
            request.del(baseUrl + 'activities/docs', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 405,
                    error: 'Method not allowed',
                    text: 'The method specified is not allowed for the ' +
                          'activity identified'
                };

                expect(res.headers.allow).to.equal('GET, POST');
                expect(jsonBody).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(405);

                request.get(baseUrl + 'activities', function(err, res, body) {
                    var jsBody = JSON.parse(body);
                    var expectedResult = [
                        {
                            name: 'Documentation',
                            slug: 'docs',
                            id: 1
                        },
                        {
                            name: 'Development',
                            slug: 'dev',
                            id: 2
                        },
                        {
                            name: 'Systems',
                            slug: 'sys',
                            id: 3
                        }
                    ];

                    expect(err).to.be.a('null');
                    expect(res.statusCode).to.equal(200);
                    expect(jsBody).to.deep.have.same.members(expectedResult);

                    done();
                });
            });
        });
    });
};
