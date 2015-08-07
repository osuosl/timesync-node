module.exports = function(expect, request, baseUrl) {
    /* GET one of the /times endpoints and check its response against
       what should be returned */
    describe('GET /times', function() {
        it('returns all times in the database', function(done) {
            request.get(baseUrl + 'times', function(err, res, body) {
                var expectedResults = [
                    {
                        duration: 12,
                        user: 'tschuy',
                        project: ['wf'],
                        activities: ['docs', 'dev'],
                        notes: '',
                        //jscs:disable
                        issue_uri: 'https://github.com/osu-cass' +
                            '/whats-fresh-api/issues/56',
                        date_worked: '2015-04-19',
                        created_at: '2015-04-19',
                        updated_at: null,
                        id: 1
                    }
                ];

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);
                expect(JSON.parse(body)).to.deep.have.same
                    .members(expectedResults);
                done();
            });
        });
    });

    describe('GET /times/:id', function() {
        it('returns times by id', function(done) {
            request.get(baseUrl + 'times/1', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    duration: 12,
                    user: 'tschuy',
                    project: ['wf'],
                    activities: ['docs', 'dev'],
                    notes: '',
                    //jscs:disable
                    issue_uri: 'https://github.com/osu-cass/whats-fresh-api' +
                        '/issues/56',
                    date_worked: '2015-04-19',
                    created_at: '2015-04-19',
                    updated_at: null,
                    id: 1
                };

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                expect(jsonBody).to.deep.equal(expectedResult);
                done();
            });
        });

        it('fails with Object not found error', function(done) {
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

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

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
                        user: 'tschuy',
                        password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuI' +
                            'R8MPvSG8rwN4xyaF5W'
                    },
                    object: time
                }
            };
        }

        var initialData = [
            {
                duration: 12,
                user: 'tschuy',
                project: ['wf'],
                activities: ['docs', 'dev'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osu-cass' +
                    '/whats-fresh-api/issues/56',
                date_worked: '2015-04-19',
                created_at: '2015-04-19',
                updated_at: null,
                //jscs:enable
                id: 1
            }
        ];

        it('creates a new time', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res, body) {

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                time.id = body.id;
                expect(body).to.deep.equal(time);

                request.get(baseUrl + 'times', function(err, res, body) {
                    var expectedResults = initialData.concat([
                        {
                            duration: 20,
                            user: 'tschuy',
                            project: ['pgd'],
                            activities: ['dev', 'docs'],
                            notes: '',
                            //jscs:disable
                            issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                            date_worked: '2015-07-30',
                            updated_at: null,
                            //jscs:enable
                            id: 2
                        }
                    ]);
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    console.log(JSON.parse(body));
                    //console.log(expectedResults);
                    expect(JSON.parse(body)).to.deep.include
                        .members(expectedResults);
                    done();
                });
            });
        });

        it('fails with a negative duration', function() {
            var time = {
                duration: -20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res, body) {
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field duration of time should be positive number ' +
                        'but was sent as negative number.'
                };

                expect(body).to.eql(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-numeric duration', function() {
            var time = {
                duration: 'twenty',
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field duration of time should be positive number ' +
                        'but was sent as string.'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad activity', function() {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs', 'dancing'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Invalid foreign key',
                    status: 409,
                    text: 'The time does not contain a valid activity reference'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(409);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad project', function() {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'project? we need a project?',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Invalid foreign key',
                    status: 409,
                    text: 'The time does not contain a valid project reference'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad issue URI', function() {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'I do my own thing, pal',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field issue_uri of time should be valid URI but ' +
                          'was sent as "I do my own thing, pal"'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad owner', function() {
            var time = {
                duration: 20,
                user: 'jenkinsl',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times', time);

            request.post(postArg, function(err, res) {
                var jsonBody = JSON.parse(body);
                var expectedResult = {
                    error: 'Authorization failure',
                    status: 401,
                    text: 'User tschuy is not authorized to create time ' +
                        'entries for user jenkinsl'
                };

                expect(jsonBody).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });
    });
};
