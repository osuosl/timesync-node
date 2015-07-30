var helper = require('../src/helpers');

module.exports = function(expect) {
    describe('checkActivities helper function', function() {
        it('Returns true when passed valid activity slugs', function(done) {
            expect(helper.checkActivities(['developing',
                                           'meeting',
                                           'planning'])).to.equal(true);
            done();
        });

        it('Returns false when passed invalid activity slug', function(done) {
            expect(helper.checkActivities(['developing',
                                           'meeting',
                                           'notanactivity'])).to.equal(false);
            done();
        });

        it('Returns false when passed null parameter', function(done) {
            expect(helper.checkActivities(['developing',
                                           'meeting',
                                           null])).to.equal(false);
            done();
        });
    });
};
