'use strict';

const errors = require('../src/errors');

module.exports = function(expect) {
  describe('5: errorInvalidIdentifier', function() {
    it('returns x already exists for array of items', function(done) {
      const err = errors.errorInvalidIdentifier('x', ['a', 'b']);
      expect(err.status).to.equal(400);
      expect(err.error).to.equal('The provided identifier was invalid');
      expect(err.text).to.equal('Expected x but received: a, b');
      expect(err.values).to.deep.equal(['a', 'b']);
      done();
    });

    it('returns x already exists for single x', function(done) {
      const err = errors.errorInvalidIdentifier('x', 'a');
      expect(err.status).to.equal(400);
      expect(err.error).to.equal('The provided identifier was invalid');
      expect(err.text).to.equal('Expected x but received a');
      expect(err.values).to.deep.equal(['a']);
      done();
    });
  });

  describe('6: errorInvalidUsername', function() {
    it('returns invalid username error', function(done) {
      const err = errors.errorInvalidUsername('bob');
      expect(err.status).to.equal(401);
      expect(err.error).to.equal('Invalid username');
      expect(err.text).to.equal('bob is not a valid username');
      done();
    });
  });

  describe('7: errorAuthenticationFailure', function() {
    it('returns authentication failure block', function(done) {
      const err = errors.errorAuthenticationFailure('Invalid key');
      expect(err.status).to.equal(401);
      expect(err.error).to.equal('Authentication failure');
      expect(err.text).to.equal('Invalid key');
      done();
    });
  });

  describe('8: errorSlugsAlreadyExist', function() {
    it('returns slug already exists for single slug', function(done) {
      const err = errors.errorSlugsAlreadyExist(['project1']);
      expect(err.status).to.equal(409);
      expect(err.error).to.equal('The slug provided already exists');
      expect(err.text).to.equal('slug project1 already exists');
      done();
    });

    it('returns slugs already exist for multiple slug', function(done) {
      const err = errors.errorSlugsAlreadyExist(['p1', 'project1']);
      expect(err.status).to.equal(409);
      expect(err.error).to.equal('The slug provided already exists');
      expect(err.text).to.equal('slugs p1, project1 already exist');
      done();
    });
  });
};
