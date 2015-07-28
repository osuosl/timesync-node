module.exports = function(expect, request, baseUrl) {
    describe('GET /projects', function() {
        it('should return all projects in the database', function(done) {
            request.get(baseUrl + 'projects', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(null,
                    res.body));
                var expectedResults = [
                    {
                        uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
                        name: 'Ganeti Web Manager',
                        slugs: ['gwm', 'ganeti-webmgr'],
                        owner: 'tschuy',
                        id: 1
                    },
                    {
                        uri: 'https://code.osuosl.org/projects/pgd',
                        name: 'Protein Geometry Database',
                        slugs: ['pgd'],
                        owner: 'deanj',
                        id: 2
                    },
                    {
                        uri: 'https://github.com/osu-cass/whats-fresh-api',
                        name: 'Whats Fresh',
                        slugs: ['wf'],
                        owner: 'tschuy',
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

    describe('GET /projects/:slug', function() {
        it('should return projects by slug', function(done) {
            request.get(baseUrl + 'projects/gwm', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResult = {
                    uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
                    name: 'Ganeti Web Manager',
                    slugs: ['gwm', 'ganeti-webmgr'],
                    owner: 'tschuy',
                    id: 1
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
            request.get(baseUrl + 'projects/404', function(err, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(
                    null, res.body));
                var expectedResult = {
                    error: "The provided slug wasn't valid",
                    errno: 6,
                    text: '404 is not a valid project slug.'
                };

                expect(jsonBody).to.eql(expectedResult);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });
    });
};
