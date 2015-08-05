module.exports = function(expect, request, baseUrl) {
    /* GET one of the /times endpoints and check its response against
       what should be returned */
    describe('GET /times', function() {
        it('should return all times in the database', function(done) {
            request.get(baseUrl + 'times', function(err, res, body) {
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['pgd'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-22',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 4
                    }
                ];

                var results = JSON.parse(body);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.eql(200);
                expect(results).to.deep.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user', function() {
        it('should return all times for a user', function(done) {
            request.get(baseUrl + 'times?user=deanj', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?project=:project', function() {
        it('should return all times for a project', function(done) {
            request.get(baseUrl + 'times?project=gwm', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?activity=:activity', function() {
        it('should return all times for an activity', function(done) {
            request.get(baseUrl + 'times?activity=docs', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['pgd'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-22',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 4
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?dateStart=:start', function() {
        it('should return all times after a date', function(done) {
            request.get(baseUrl + 'times?dateStart=2015-04-20',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['pgd'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-22',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 4
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?dateEnd=:end', function() {
        it('should return all times before a date', function(done) {
            request.get(baseUrl + 'times?dateEnd=2015-04-21',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?dateStart=:start&dateEnd=:end', function() {
        it('should return all times between two dates', function(done) {
            request.get(baseUrl + 'times?dateStart=2015-04-20' +
            '&dateEnd=2015-04-21', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user1&user=:user2', function() {
        it('should return all times for two users', function(done) {
            request.get(baseUrl + 'times?user=deanj&user=patcht',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&project=:project', function() {
        it('should return all times for a user and a project', function(done) {
            request.get(baseUrl + 'times?user=deanj&project=gwm',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&activity=:activity', function() {
        it('should return all times for a user and an activity',
        function(done) {
            request.get(baseUrl + 'times?user=deanj&activity=docs',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&startDate=:start', function() {
        it('should return all times for a user after a date', function(done) {
            request.get(baseUrl + 'times?user=deanj&startDate=2015-04-20',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['pgd'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-20',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 2
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&endDate=:end', function() {
        it('should return all times for a user before a date', function(done) {
            request.get(baseUrl + 'times?user=tschuy&endDate=2015-04-21',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&startDate=:start&endDate=:end', function() {
        it('should return all times for a user between two dates',
        function(done) {
            request.get(baseUrl + 'times?user=deanj&startDate=2015-04-19' +
            '&endDate=2015-04-19', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?project=:project1&project=:project2', function() {
        it('should return all times for two projects', function(done) {
            request.get(baseUrl + 'times?project=gwm&project=wf',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?project=:project&activity=:activity', function() {
        it('should return all times for a project and an activity',
        function(done) {
            request.get(baseUrl + 'times?project=gwm&activity=dev',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?project=:project&startDate=:start', function() {
        it('should return all times for a project after a date',
        function(done) {
            request.get(baseUrl + 'times?project=gwm&startDate=2015-04-20',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?project=:project&endDate=:end', function() {
        it('should return all times for a project before a date',
        function(done) {
            request.get(baseUrl + 'times?project=gwm&endDate=2015-04-20',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?project=:project&startDate=:start&endDate=:end',
    function() {
        it('should return all times for a project between two dates',
        function(done) {
            request.get(baseUrl + 'times?project=gwm&startDate=2015-04-19' +
            '&endDate=2015-04-21', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?activity=:activity1&activity=:activity2', function() {
        it('should return all times for two activities', function(done) {
            request.get(baseUrl + 'times?activity=docs&activity=pgd',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['pgd'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-22',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 4
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?activity=:activity&startDate=:start', function() {
        it('should return all times for an activity after a date',
        function(done) {
            request.get(baseUrl + 'times?activity=docs&startDate=2015-04-19',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    },
                    {
                        duration:12,
                        user:'tschuy',
                        project:['pgd'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-22',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 4
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?activity=:activity&endDate=:end', function() {
        it('should return all times for an activity before a date',
        function(done) {
            request.get(baseUrl + 'times?activity=docs&endDate=2015-04-21',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?activity=:activity&startDate=:start&endDate=:end',
    function() {
        it('should return all times for an activity between two dates',
        function(done) {
            request.get(baseUrl + 'times?activity=docs&startDate=2015-04-19' +
            '&endDate=2015-04-20', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&project=:project&activity=:activity&' +
    'startDate=:start&endDate=:end', function() {
        it('should return all times for a user, project, and activity ' +
        'between two dates', function(done) {
            request.get(baseUrl + 'times?user=tschuy&project=pgd&' +
            'activity=docs' + '&startDate=2015-04-20&endDate=2015-04-22',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'tschuy',
                        project:['pgd'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-22',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 4
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user1&user=:user2&project=:project&' +
    'activity=:activity&startDate=:start&endDate=:end', function() {
        it('should return all times for two users, a project, and activity ' +
        'between two dates', function(done) {
            request.get(baseUrl + 'times?user=deanj&user=tschuy&project=gwm&' +
            'activity=dev&startDate=2015-04-19&endDate=2015-04-21',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'tschuy',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['dev'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-21',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 3
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&project=:project1&project=:project2&' +
    'activity=:activity&startDate=:start&endDate=:end', function() {
        it('should return all times for a user, two projects, and an ' +
        'activity between two dates', function(done) {
            request.get(baseUrl + 'times?user=deanj&project=gwm&project=pgd&' +
            'activity=docs&startDate=2015-04-19&endDate=2015-04-20',
            function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /times?user=:user&project=:project&activity=:activity1&' +
    'activity=:activity2&startDate=:start&endDate=:end', function() {
        it('should return all times for a user, project, and two activities ' +
        'between two dates', function(done) {
            request.get(baseUrl + 'times?user=deanj&project=gwm&' +
            'activity=docs&activity=dev&startDate=2015-04-19&' +
            'endDate=2015-04-20', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        duration:12,
                        user:'deanj',
                        project:['ganeti-webmgr', 'gwm'],
                        activities:['docs'],
                        notes:'',
                        //jscs:disable
                        issue_uri:
                        'https://github.com/osu-cass/whats-fresh-api/issues/56',
                        date_worked:'2015-04-19',
                        created_at:null,
                        updated_at:null,
                        //jscs:enable
                        id: 1
                    }
                ];

                var results = JSON.parse(bodyAsString);
                expect(results.length === expectedResults.length);
                for (var i = 0, len = results.length; i < len; i++) {
                    expectedResults[i].project.sort();
                    expectedResults[i].activities.sort();
                    results[i].project.sort();
                    results[i].activities.sort();
                }

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(results).to.eql(expectedResults);
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
                    user: 'deanj',
                    project: ['ganeti-webmgr', 'gwm'],
                    activities: ['docs'],
                    notes: '',
                    //jscs:disable
                    issue_uri:
                    'https://github.com/osu-cass/whats-fresh-api/issues/56',
                    date_worked: '2015-04-19',
                    created_at: null,
                    updated_at: null,
                    //jscs:enable
                    id: 1
                };

                expectedResult.project.sort();
                expectedResult.activities.sort();
                jsonBody.project.sort();
                jsonBody.activities.sort();

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
};
