module.exports = function(expect, request, baseUrl) {
    /* DELETE one of the activities endpoints and check whether it can still
       be retrieved from the database */

    describe('DELETE /activities/:slug', function() {
        it('Deletes the activity affiliated with the activity slug',
        function(done) {
            request.del(baseUrl + 'activity/docs', function(err, res) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);
                expect('docs').to.be.an('undefined');

                // Checks to see that the activity has been deleted from the db
                request.get(baseUrl + 'activities/docs',
                function(err, res, body) {
                    var jsonBody = JSON.parse(body);
                    var expectedError = {
                        status: 404,
                        error: 'Object not found',
                        text: 'Nonexistent activity'
                    };

                    expect(jsonBody).to.deep.have.same.members(expectedError);
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });

        // Checks that delete will fail w/ nonexistent slug
        it('Fails if it receives a bad slug', function(done) {
            request.del(baseUrl + 'activities/naps', function(err, res) {
                expect('naps').to.be.an('undefined');
                expect(res.statusCode).to.equal(404);
                done();
            });
        });

        // Checks that delete will fail w/ invalid slug
        it('Fails if it receives an invalid slug', function(done) {
            request.del(baseUrl + 'activities/###!what', function(err, res) {
                expect('###!what').to.be.an('undefined');
                expect(res.statusCode).to.equal(400);
                done();
            });
        });
    });
};
