module.exports = function(expect, request, baseUrl) {
    /* GET one of the /times endpoints and check its response against
       what should be returned */
    describe('GET /times', function() {
        it('should return all times in the database', function(done) {
            request.get(baseUrl + 'times', function(err, res, body) {
                var expectedResults = [
                    {
                        //jscs:disable
                        duration: 12,
                        user: 'tschuy',
                        project: ['wf'],
                        activities: ['docs', 'dev'],
                        notes: '',
                        issue_uri: 'https://github.com/osu-cass' +
                            '/whats-fresh-api/issues/56',
                        date_worked: null,
                        created_at: null,
                        updated_at: null,
                        id: 1
                        //jscs:enable
                    }
                ];

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);
                expect(JSON.parse(body)).to.deep.equal(expectedResults);
                done();
            });
        });
    });

    describe('GET /times/:id', function() {
        it('should return times by id', function(done) {
            request.get(baseUrl + 'times/1', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    //jscs:disable
                    duration: 12,
                    user: 'tschuy',
                    project: ['wf'],
                    activities: ['docs', 'dev'],
                    notes: '',
                    issue_uri: 'https://github.com/osu-cass/whats-fresh-api' +
                        '/issues/56',
                    date_worked: null,
                    created_at: null,
                    updated_at: null,
                    id: 1
                    //jscs:enable
                };

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                expect(jsonBody).to.deep.equal(expectedResult);
                done();
            });
        });

        it('should fail with Object not found error', function(done) {
            request.get(baseUrl + 'times/404', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Object not found',
                    status: 404,
                    text: 'Nonexistent time'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });

        it('fails with Invalid Identifier error', function(done) {
            request.get(baseUrl + 'times/cat', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'The provided identifier was invalid',
                    status: 400,
                    text: 'Expected ID but received cat'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });

    /* DELETE one of the times endpoints and check whether it can still be
       retrieved from the database */

    describe('DELETE /times/:id', function() {
        it('deletes the desired time instance', function(done) {
            request.del(baseUrl + 'times/1', function(err, res) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);

                // Check if time instance was deleted from db
                request.get(baseUrl + 'times/1', function(err, res, body) {
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

        // Checks that a nonexistent time id will fail /ex: time id = 6013
        it('fails if it receives a nonexistent time id', function(done) {
            request.del(baseUrl + 'times/6013', function(err, res, body) {
                var expectedError = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent time id'
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(404);
                
                request.get(baseUrl + 'times', function(err, res, body) {
                    var jsonBody = JSON.parse(body);
                    var expectedResult = {
                        duration: 12,
                        user: 'users:1',
                        project: 'projects:2',
                        notes: '',
                        issue_uri: 'https:://github.com/osu-cass/' +
                                   'whats-fresh-api/issues/56',
                        date_worked: null,
                        created_at: null,
                        updated_at: null,
                        id: 1
                    };

                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);                    
                    expect(jsonBody).to.deep.equal(expectedResult);
                    
                    done();
                });
            });
        });

        // Checks that an invalid time id will fail /ex: time id = 'tabby'
        it('fails if it receives an invalid time id', function(done) {
            request.del(baseUrl + 'times/tabby', function(err, res, body) {
                var expectedError = {
                    status: 400,
                    error: 'Invalid indentifier',
                    text: 'Expected integer but received a string'
                };

                expect(body).to.deep.equal(expectedError);
                expect(res.statusCode).to.equal(400);
                
                request.get(baseUrl + 'times', function(err, res, body) {
                    var jsonBody = JSON.parse(body);
                    var expectedResult = {
                        duration: 12,
                        user: 'users:1',
                        project: 'projects:2',
                        notes: '',
                        issue_uri: 'https:://github.com/osu-cass/' +
                                   'whats-fresh-api/issues/56',
                        date_worked: null,
                        created_at: null,
                        updated_at: null,
                        id: 1
                    };

                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(jsonBody).to.deep.equal(expectedResult);

                    done();
                });
            });
        });
    });
};
