var helper = require('../src/helpers');

module.exports = function(expect) {
    describe('check projects', function() {
        it('should return true', function(done) {
            expect(helper.check_project('gwm')).to.equal(true);
            done();
        });

        it('should return false', function(done) {
            expect(helper.check_project('notaproject')).to.equal(false);
            done();
        });

        it('should return false', function(done) {
            expect(helper.check_project(null)).to.equal(false);
            done();
        });
    });
};
