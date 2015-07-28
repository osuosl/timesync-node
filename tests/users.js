module.exports = function(expect, request, baseUrl) {
    describe('GET /users', function() {
        it('should return all users in the database', function(done) {
            request.get(baseUrl + 'users', function(err, res) {
                var bodyAsString = String.fromCharCode.apply(null, res.body);
                var expectedResults = [
                    {
                        id: 1,
                        username: 'deanj'
                    },
                    {
                        id: 2,
                        username: 'tschuy'
                    }
                ];
                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(JSON.parse(bodyAsString)).to.eql(expectedResults);
                done();
            });
        });
    });
};
