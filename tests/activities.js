module.exports = function(expect, request, base_url) {
    describe('GET /activities', function() {
        it('should return all activities in the database', function(done) {
            request.get(base_url + 'activities', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expected_results = [
                    {
                        name: 'Documentation',
                        slugs: ['doc'],
                        id: 1
                    },
                    {
                        name: 'Development',
                        slugs: ['dev'],
                        id: 2
                    },
                    {
                        name: 'Systems',
                        slugs: ['sysadmin', 'sys'],
                        id: 3
                    }
                ];

                [expected_results, json_body].forEach(function(list) {
                    list.forEach(function(result) {
                        result.slugs.sort();
                    });
                });

                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(json_body).to.eql(expected_results);
                done();
            });
        });
    });

    describe('GET /activities/:slug', function() {
        it('should return activities by slug', function(done) {
            request.get(base_url + 'activities/sys', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expected_result = {
                    name: 'Systems',
                    slugs: ['sys', 'sysadmin'],
                    id: 3
                };
                expected_result.slugs.sort();
                json_body.slugs.sort();

                expect(err === null);
                expect(res.statusCode).to.be(200);

                expect(json_body).to.eql(expected_result);
                done();
            });
        });

        it('should fail with invalid slug error', function(done) {
            request.get(base_url + 'activities/404', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expected_result = {
                    error: "The provided slug wasn't valid",
                    errno: 6,
                    text: '404 is not a valid activity slug.'
                };

                expect(json_body).to.eql(expected_result);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });
    });
};
