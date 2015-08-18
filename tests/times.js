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
                        username: 'tschuy',
                        password: 'password'
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

        it('creates a new time with activities', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                time.id = body.id;
                expect(body).to.deep.equal(time);

                createdAt = new Date().toISOString().substring(0, 10);
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
                            created_at: createdAt,
                            updated_at: null,
                            //jscs:enable
                            id: 2
                        }
                    ]);
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.have.same
                        .members(expectedResults);
                    done();
                });
            });
        });

        it('fails with a bad password', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);
            postArg.body.auth.password = 'not the real password';

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Authentication failure',
                    status: 401,
                    text: 'Incorrect password.'
                };

                expect(res.statusCode).to.equal(401);
                expect(body).to.deep.equal(expectedResult);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.deep.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a missing login', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);
            delete postArg.body.auth;

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Authentication failure',
                    status: 401,
                    text: 'Missing credentials'
                };

                expect(res.statusCode).to.equal(401);
                expect(body).to.deep.equal(expectedResult);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.deep.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a negative duration', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field duration of time should be positive number ' +
                        'but was sent as negative number'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-numeric duration', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field duration of time should be number ' +
                        'but was sent as string'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a missing duration', function(done) {
            var time = {
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'The time is missing a duration'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad activity', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs', 'activity_!@#'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field activities of time should be slugs but ' +
                        'was sent as array containing at least 1 invalid slug'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-existent activity', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Invalid foreign key',
                    status: 409,
                    text: 'The time does not contain a valid activities ' +
                        'reference.'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(409);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-string activity', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs', -14],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field activities of time should be slugs but was ' +
                        'sent as array containing at least 1 number'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-array activities', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: 1.414141414,
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field activities of time should be array but was ' +
                        'sent as number'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with missing activities', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'The time is missing a activities'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad project', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field project of time should be slug but was sent ' +
                        'as invalid slug project? we need a project?'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-existent project', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'project-xyz',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Invalid foreign key',
                    status: 409,
                    text: 'The time does not contain a valid project reference.'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(409);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-string project', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: ['Who needs', 'proper types?'],
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field project of time should be string but was ' +
                        'sent as array'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a missing project', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'The time is missing a project'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad issue URI', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field issue_uri of time should be URI but ' +
                          'was sent as invalid URI I do my own thing, pal'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-string issue URI', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 3.14159265,
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field issue_uri of time should be string but ' +
                          'was sent as number'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('works with a missing issue URI', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                expect(err).to.equal(null);
                expect(res.statusCode).to.equal(200);

                time.id = body.id;
                expect(body).to.deep.equal(time);

                createdAt = new Date().toISOString().substring(0, 10);
                request.get(baseUrl + 'times', function(err, res, body) {
                    var expectedResults = initialData.concat([
                        {
                            duration: 20,
                            user: 'tschuy',
                            project: ['pgd'],
                            activities: ['dev', 'docs'],
                            notes: '',
                            //jscs:disable
                            issue_uri: null,
                            date_worked: '2015-07-30',
                            created_at: createdAt,
                            updated_at: null,
                            //jscs:enable
                            id: 2
                        }
                    ]);
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.have.same
                        .members(expectedResults);
                    done();
                });
            });
        });

        it('fails with a bad user', function(done) {
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

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Authorization failure',
                    status: 401,
                    text: 'tschuy is not authorized to create time ' +
                        'entries for jenkinsl'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(401);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-string user', function(done) {
            var time = {
                duration: 20,
                user: {username: 'tschuy'},
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field user of time should be string but ' +
                          'was sent as object'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a missing user', function(done) {
            var time = {
                duration: 20,
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: '2015-07-30'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'The time is missing a user'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a bad date worked', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: 'baaaaaaaad'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field date_worked of time should be ISO-8601 date ' +
                        'but was sent as baaaaaaaad'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a non-string date worked', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1',
                date_worked: 1234
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'Field date_worked of time should be string ' +
                        'but was sent as number'
                };

                expect(body).to.deep.equal(expectedResult);
                expect(res.statusCode).to.equal(400);

                request.get(baseUrl + 'times', function(err, res, body) {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal(initialData);
                    done();
                });
            });
        });

        it('fails with a missing date worked', function(done) {
            var time = {
                duration: 20,
                user: 'tschuy',
                project: 'pgd',
                activities: ['dev', 'docs'],
                notes: '',
                //jscs:disable
                issue_uri: 'https://github.com/osuosl/pgd/issues/1'
                //jscs:enable
            };

            var postArg = getPostObject(baseUrl + 'times/', time);

            request.post(postArg, function(err, res, body) {

                var expectedResult = {
                    error: 'Bad object',
                    status: 400,
                    text: 'The time is missing a date_worked'
                };

                expect(body).to.deep.equal(expectedResult);
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
