module.exports = function(expect, request, base_url) {
    describe('GET /times', function() {
        it('should return all times in the database', function(done) {
            request.get(base_url + 'times', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expected_results = [
                    {
                        duration: 12,
                        user: 'tschuy',
                        project: ['wf'],
                        activity: ['dev'],
                        notes: '',
                        issue_uri: 'https://github.com/osu-cass' +
                            '/whats-fresh-api/issues/56',
                        date_worked: null,
                        created_at: null,
                        updated_at: null,
                        id: 1
                    }
                ];
                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(JSON.parse(bodyAsString)).to.eql(expected_results);
                done();
            });
        });
    });

    describe('GET /times/:id', function() {
        it('should return times by id', function(done) {
            request.get(base_url + 'times/1', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expected_result = {
                    duration: 12,
                    user: 'tschuy',
                    project: ['wf'],
                    activity: ['dev'],
                    notes: '',
                    issue_uri: 'https://github.com/osu-cass/whats-fresh-api' +
                        '/issues/56',
                    date_worked: null,
                    created_at: null,
                    updated_at: null,
                    id: 1
                };

                expected_result.project.sort();
                expected_result.activity.sort();
                json_body.project.sort();
                json_body.activity.sort();

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                expect(json_body).to.eql(expected_result);
                done();
            });
        });

        it('should fail with Object not found error', function(done) {
            request.get(base_url + 'times/404', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expected_result = {
                    error: 'Object not found',
                    errno: 1,
                    text: 'Invalid time id'
                };

                expect(json_body).to.eql(expected_result);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });
    });
};
