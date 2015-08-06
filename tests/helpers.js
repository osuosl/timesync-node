var helpers = require('../src/helpers');

module.exports = function(expect) {
    describe('checkActivities', function() {
        it('returns a list of activities IDs for proper slugs', function(done) {
            helpers.checkActivities(['docs', 'dev']).then(function(activities) {
                expect(activities).to.deep.have.same.members([1, 2]);
                done();
            });
        });

        it('throws when passed undefined', function(done) {
            helpers.checkActivities(undefined).then().catch(function(err) {
                console.log(err);
                expect(err).to.be.an('undefined');
                done();
            });
        });

        it('throws when passed a list containing bad slugs', function(done) {
            helpers.checkActivities(['docs', 'dev', 'cats', 'dogs']).then()
            .catch(function(err) {
                err.sort();
                expect(err).to.deep.have.same.members(['cats', 'dogs'].sort());
                done();
            });
        });

        it('throws when passed a list containing a null slug', function(done) {
            helpers.checkActivities(null).then()
            .catch(function(err) {
                expect(err).to.deep.equal(null);
                done();
            });
        });
    });
};
