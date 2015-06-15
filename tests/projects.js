module.exports = function(expect, request, base_url) {
  describe('GET /projects', function() {
    it ('should return all projects in the database', function(done) {
      request.get(base_url + 'projects', function(err,
          res, body) {
        var json_body = JSON.parse(String.fromCharCode.apply(null, res.body));
        var expected_results = [
          {
            "uri": "https://code.osuosl.org/projects/ganeti-webmgr",
            "name": "Ganeti Web Manager",
            "slugs": ["gwm", "ganeti-webmgr"],
            "owner": 2,
            "id": 1
          },
          {
            "uri": "https://code.osuosl.org/projects/pgd",
            "name": "Protein Geometry Database",
            "slugs": ["pgd"],
            "owner": 1,
            "id": 2
          },
          {
            "uri": "https://github.com/osu-cass/whats-fresh-api",
            "name": "Whats Fresh",
            "slugs": ["wf"],
            "owner": 2,
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

  describe('GET /projects/:id', function() {
    it ('should return projects by id', function(done) {
      request.get(base_url + 'projects/1', function(err, res, body) {
        var json_body = JSON.parse(String.fromCharCode.apply(null, res.body));
        var expected_result = {
            "uri": "https://code.osuosl.org/projects/ganeti-webmgr",
            "name": "Ganeti Web Manager",
            "slugs": ["gwm", "ganeti-webmgr"],
            "owner": 2,
            "id": 1
          }
        expected_result.slugs.sort();
        json_body.slugs.sort();

        expect(err == null);
        expect(res.statusCode).to.be(200);

        expect(json_body).to.eql(expected_result);
        done();
      });
    });
  });
}