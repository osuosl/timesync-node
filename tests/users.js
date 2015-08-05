module.exports = function(expect, request, baseUrl) {
    describe('GET /users', function() {
        it('should return all users in the database', function(done) {
            request.get(baseUrl + 'users', function(err, res, body) {
                var jsonBody = JSON.parse(body);
                var expectedResults = [
                    {
                        id: 1,
                        username: 'deanj'
                    },
                    {
                        id: 2,
                        username: 'tschuy'
                    },
                    {
                        id: 3,
                        username: 'patcht'
                    }

                ];
                expect(err === null);
                expect(res.statusCode).to.be(200);
                expect(jsonBody).to.deep.equal(expectedResults);
                done();
            });
        });
    });
};
