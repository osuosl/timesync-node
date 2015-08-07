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
                    text: 'Expected slug but received test-!*@'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });

    /* DELETE one of the activities endpoints and check whether it can still
       be retrieved from the database */

    describe('DELETE /activities/:slug', function() {
        it('Deletes the activity affiliated with the activity slug',
        function(done) {
            request.del(baseUrl + 'activity/docs', function(err, res) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);
                expect('docs').to.be.an('undefined');

                // Checks to see that the activity has been deleted from the db
                request.get(baseUrl + 'activities/docs',
                function(err, res, body) {
                    var jsonBody = JSON.parse(body);
                    var expectedError = {
                        status: 404,
                        error: 'Object not found',
                        text: 'Nonexistent activity'
                    };

                    expect(jsonBody).to.deep.have.same.members(expectedError);
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });

        // Checks that delete will fail w/ nonexistent slug
        it('Fails if it receives a bad slug', function(done) {
            request.del(baseUrl + 'activities/naps', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent activity'
                };                 

                expect('naps').to.be.an('undefined');
                expect(jsonBody).to.deep.have.same.members(expectedError);
                expect(res.statusCode).to.equal(404);
                done();
            });
        });

        // Checks that delete will fail w/ invalid slug
        it('Fails if it receives an invalid slug', function(done) {
            request.del(baseUrl + 'activities/###!what',
            function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedError = JSON.parse(body);
                    status: 400,
                    error: 'Invalid identifier',
                    text: "Expected slug but received '###!what'"
                };

                expect('###!what').to.be.an('undefined');
                expect(jsonBody).to.deep.have.same.members(expectedError);
                expect(res.statusCode).to.equal(400);
                done();
            });
        });
    });
};
