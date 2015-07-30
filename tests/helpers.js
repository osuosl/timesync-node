// test/helpers.js

var helper = require('../src/helpers');

module.exports = function(expect) {
    describe('checkDateTime helper function', function() {
        it('Returns Unix Timestamp for valid date', function() {
            expect(helper.checkDateTime('2015-04-28')
                         .to.equal(1430179200000));
        });

        it('Returns Unix Timestamp for valid dateTime', function() {
            expect(helper.checkDateTime('2015-04-28 16:30')
                         .to.equal(1430264400000));
        });

        it('Returns `false` for a non-valid date', function() {
            expect(helper.checkDateTime('2015-04-82')
                         .to.equal(false));
        });

        it('Returns `false` for a non-valid dateTime', function() {
            expect(helper.checkDateTime('2015-04-28 24:40')
                         .to.equal(false));
        });
    });
};
