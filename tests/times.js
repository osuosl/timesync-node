module.exports = function(expect, request, baseUrl) {
    /* GET one of the /times endpoints and check its response against
       what should be returned */
    describe('GET /times', function() {
        it('should return all times in the database', function(done) {
            request.get(baseUrl + 'times', function(err, res, body) {
                var expectedResults = [
                    {
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
                    text: 'Expected ID but received cat',
                    values: ['cat']
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });

    describe('POST /times', function() {
        it('should create a new time', function(done) {
            var time = {
                //jscs:disable
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {
                auth: {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                object: time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                createdAt = Date.now().getTime() / 1000;
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
                        },
                        {
                            duration: 20,
                            user: 'tschuy',
                            project: ['pgd'],
                            activities: ['dev', 'docs'],
                            notes: '',
                            issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                            date_worked: '2015-07-30',
                            created_at: createdAt,
                            updated_at: createdAt,
                            id: 2
                            //jscs:enable
                        }
                    ];
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });

        it('should fail with a negative duration', function() {
            var time = {
                //jscs:disable
                duration: -20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {
                auth: {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                object: time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field duration of time should be positive number ' +
                        'but was sent as negative number.'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });

        it('should fail with a non-numeric duration', function() {
            var time = {
                //jscs:disable
                duration: 'twenty',
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {
                auth: {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                object: time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field duration of time should be positive number ' +
                        'but was sent as string.'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });

        it('should fail with a bad activity', function() {
            var time = {
                //jscs:disable
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs', 'dancing'],
                notes: '',
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {
                auth: {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                object: time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Invalid foreign key',
                    status: 409,
                    text: 'The time does not contain a valid activity reference'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });

        it('should fail with a bad project', function() {
            var time = {
                //jscs:disable
                duration: 20,
                user: 'tschuy',
                project: 'project? we need a project?',
                activities: ['dev', 'docs'],
                notes: '',
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {
                auth: {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                object: time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Invalid foreign key',
                    status: 409,
                    text: 'The time does not contain a valid project reference'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });

        it('should fail with a bad issue URI', function() {
            var time = {
                //jscs:disable
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                issue_uri: 'I do my own thing, pal',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {
                auth: {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                object: time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field issue_uri of time should be valid URI but ' +
                          'was sent as "I do my own thing, pal"'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });

        it('should fail with a bad owner', function() {
            var time = {
                //jscs:disable
                duration: 20,
                user: 'deanj',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                issue_uri: 'I do my own thing, pal',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = {auth:
                {
                    user: 'tschuy',
                    password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8M' +
                              'PvSG8rwN4xyaF5W'
                },
                time
            };

            request.post(baseUrl + 'times/', postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field owner of time should be authorized user but ' +
                          'was sent as deanj'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                    expect(err).to.be(null);
                    expect(res.statusCode).to.be(200);
                    expect(JSON.parse(body)).to.eql(expectedResults);
                    done();
                });
            });
        });
    });
};
