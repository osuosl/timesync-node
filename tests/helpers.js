// test/helpers.js

var helpers = require('../src/helpers');

module.exports = function(expect) {
    describe('checkUser', function() {
        it('Returns user ID if username == user', function(done) {
            helpers.checkUser('tschuy', 'tschuy').then(function(userID) {
                expect(userID).to.equal(2);
                done();
            });
        });
        // Later: Include a test that checks if username is admin
        it('Returns false if username !== user', function(done) {
            helpers.checkUser('notauser', 'tschuy').then()
            .catch(function(err) {
                expect(err).to.be.an('undefined');
                done();
            });
        });
    });
};
