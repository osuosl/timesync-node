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
    });
};
