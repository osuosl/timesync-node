module.exports = function(expect, request, base_url) {
    describe('GET /projects', function() {
        it('should return all projects in the database', function(done) {
            request.get(base_url + 'projects', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode
                    .apply(null, res.body));
                var expected_results = [
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

                [expected_results, json_body].forEach(function(list) {
                    list.forEach(function(result) {
                        result.slugs.sort();
                    });
                });

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                expect(json_body).to.eql(expected_results);
                done();
            });
        });
    });

    describe('GET /projects/:slug', function() {
        it('should return projects by slug', function(done) {
            request.get(base_url + 'projects/gwm', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode
                    .apply(null, res.body));
                var expected_result = {
                    uri: 'https://code.osuosl.org/projects/ganeti-webmgr',
                    name: 'Ganeti Web Manager',
                    slugs: ['gwm', 'ganeti-webmgr'],
                    owner: 'tschuy',
                    id: 1
                };
                expected_result.slugs.sort();
                json_body.slugs.sort();

                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);

                expect(json_body).to.eql(expected_result);
                done();
            });
        });

        it('should fail with Object Not Found error', function(done) {
            request.get(base_url + 'projects/test-404', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode
                    .apply(null, res.body));
                var expected_result = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent project'
                };

                expect(json_body).to.eql(expected_result);
                expect(res.statusCode).to.equal(404);

                done();
            });
        });

        it('should fail with Invalid Slug error', function(done) {
            request.get(base_url + 'projects/test-!*@', function(err, res) {
                var json_body = JSON.parse(String.fromCharCode
                    .apply(null, res.body));
                var expected_result = {
                    status: 400,
                    error: 'The provided identifier was invalid',
                    text: 'Expected slug but received test-!*@'
                };

                expect(json_body).to.eql(expected_result);
                expect(res.statusCode).to.equal(400);

                done();
            });
        });
    });
};
