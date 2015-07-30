module.exports = function(expect, request, baseUrl) {
    describe('GET /users', function() {
        it('returns all users in the database', function(done) {
            request.get(baseUrl + 'users', function(err, res, body) {
                var expectedResults = [
                    {
                        id: 1,
                        username: 'deanj',
                        active: 'false',
                        //Hash generated from password 'pass'
                        //jscs:disable maximumLineLength
                        password: '$2a$10$nkGN8eZN1DbOahNfv8YgWO790imw7poGcjfik1k0zQ9mFqYqtMY0y'
                        //jscs:enable maximumLineLength
                    },
                    {
                        id: 2,
                        username: 'tschuy',
                        active: 'true',
                        //Hash generated from password 'password'
                        //jscs:disable maximumLineLength
                        password: '$2a$10$6jHQo4XTceYyQ/SzgtdhleQqkuy2G27omuIR8MPvSG8rwN4xyaF5W'
                        //jscs:enable maximumLineLength
                    }
                ];
                expect(err).to.be(null);
                expect(res.statusCode).to.be(200);
                expect(JSON.parse(body)).to.eql(expectedResults);
                done();
            });
        });
    });
};
