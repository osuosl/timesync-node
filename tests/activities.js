module.exports = function(expect, request, baseUrl) {
    describe('GET /activities', function() {
        it('should return all activities in the database', function(done) {
            request.get(baseUrl + 'activities', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResults = [
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

                [expectedResults, jsonBody].forEach(function(list) {
                    list.forEach(function(result) {
                        result.slugs.sort();
                    });
                });

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(jsonBody).to.eql(expectedResults);
                done();
            });
        });
    });

    describe('GET /activities/:slug', function() {
        it('should return activities by slug', function(done) {
            request.get(baseUrl + 'activities/sys', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResult = {
                    name: 'Systems',
                    slugs: ['sys', 'sysadmin'],
                    id: 3
                };
                expectedResult.slugs.sort();
                jsonBody.slugs.sort();

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                expect(jsonBody).to.eql(expectedResult);
                done();
            });
        });

        it('should fail with invalid slug error', function(done) {
            request.get(baseUrl + 'activities/404', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResult = {
                    error: "The provided slug wasn't valid",
                    errno: 6,
                    text: '404 is not a valid activity slug.'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });
    });
};
