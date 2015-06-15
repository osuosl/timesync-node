module.exports = function(expect, request, base_url) {
  describe('GET /activities', function() {
    it ('should return all activities in the database', function(done) {
      request.get(base_url + 'activities', function(err,
          res, body) {
        var json_body = JSON.parse(String.fromCharCode.apply(null, res.body));
        var expected_results = [
          {
            "name": "Documentation",
            "slugs": ["doc"],
            "id": 1
          },
          {
            "name": "Development",
            "slugs": ["dev"],
            "id": 2
          },
          {
            "name": "Systems",
            "slugs": ["sysadmin", "sys"],
            "id": 3
          }
        ];

        [expected_results, json_body].forEach(function(list) {
          list.forEach(function(result) {
            result.slugs.sort();
          });
        });

        expect(err == null);
        expect(res.statusCode).to.be(200);
        expect(json_body).to.eql(expected_results);
        done();
      });
    });
  });
}