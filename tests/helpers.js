// test/helpers.js

var helpers = require('../src/helpers');

module.exports = function(expect) {
    describe('checkUser', function() {
        it('Returns true if username == user', function(done) {
            helpers.checkUser('tschuy').then(function() {
                //expect(authorized).to.be(true);
                done();
            });
        });
        // Include test that checks if username is admin 
        it('Returns false if username !== user', function(done) {
            helpers.checkUser(['notauser']).then().catch(function(err) {
                expect(err).to.be.an('undefined');
                done();
            });
        });
    });
};
