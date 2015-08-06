// delete endpoints
var deleter = require('../src/delete');

module.exports = function(expect, request, baseUrl) {
    /* DELETE one of the times endpoints and check whether it can still be
       retrieved from the database */
    describe('DELETE /times/:id', function() {
        it('Deletes the desired time instance', function(done) {
            deleter.deleteTime(1).then(function(time) {
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

        it('Fails if it receives an invalid time id', function(done) {
            deleter.deleteTime('notanid').then(function(timeid) {
                expect(timeid).to.be.an('undefined');
                //expect(res.statusCode).to.equal(400);
                done();
            });
        });
    });
};
