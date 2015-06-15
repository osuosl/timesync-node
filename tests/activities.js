module.exports = function(expect, request, base_url) {
  describe('GET /activities', function() {
    it ('should return all activities in the database', function(done) {
      request.get(base_url + 'activities', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "name": "Documentation",
            "slug": "doc",
            "id": 1
          },
          {
            "name": "Development",
            "slug": "dev",
            "id": 2
          },
          {
            "name": "Systems",
            "slug": "sys",
            "id": 3
          }
        ];
        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(JSON.parse(bodyAsString)).to.eql(expected_results);
        done();
      });
    });
  });
}