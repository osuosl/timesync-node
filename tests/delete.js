//var deleter = require('../src/delete');

module.exports = function(expect, request, baseUrl) {
    /* DELETE one of the times endpoints and check whether it can still be
       retrieved from the database */

    describe('DELETE /times/:id', function() {
        it('Deletes the desired time instance', function(done) {
            request.del(baseUrl + 'times/1', function(err, res) {
                expect(err).to.be.a('null');
                expect(res.statusCode).to.equal(200);
                expect(time).to.be.an('undefined');

                // Check if time instance was deleted from db
                request.get(baseUrl + 'times/1', function(err, res, body) {
                    var jsonBody = JSON.parse(body);
                    var expectedError = {
                        status: 404,
                        error: 'Object not found',
                        text: 'Nonexistent activity'
                    };

                    expect(jsonBody).to.have.same.members(expectedError);
                    expect(res.statusCode).to.equal(404);
                    done();
                });
            });
        });

        // Checks that a nonexistent time id will fail /ex: time id = 6013
        it('Fails if it receives a bad time id', function(done) {
            request.del(baseUrl + 'times/6013', function(err, res) {
                var expectedError = {
                    status: 404,
                    error: 'Object not found',
                    text: 'Nonexistent time id'
                };

                expect(6013).to.be.an('undefined');
                expect(body).to.deep.have.same.members(expectedError);
                expect(res.statusCode).to.equal(404);
                done();
            });
        });

        // Checks that an invalid time id will fail /ex: time id = 'tabby'
        it('Fails if it receives an invalid time id', function(done) {
            request.del(baseUrl + 'times/tabby', function(err, res) {
                var expectedError = {
                    status: 400,
                    error: 'Invalid indentifier',
                    text: 'Expected integer but received a string'
                };

                expect('tabby').to.be.an('undefined');
                expect(body).to.deep.have.same.members(expectedError);
                expect(res.statusCode).to.equal(400);
                done();
            });
        });
    });
};
