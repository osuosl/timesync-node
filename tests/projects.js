module.exports = function(expect, request, base_url) {
  describe('GET /projects', function() {
    it ('should return all projects in the database', function(done) {
      request.get(base_url + 'projects', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "uri": "https://code.osuosl.org/projects/ganeti-webmgr",
            "name": "Ganeti Web Manager",
            "slug": "gwm",
            "owner": 2,
            "id": 1
          },
          {
            "uri": "https://code.osuosl.org/projects/pgd",
            "name": "Protein Geometry Database",
            "slug": "pgd",
            "owner": 1,
            "id": 2
          },
          {
            "uri": "https://github.com/osu-cass/whats-fresh-api",
            "name": "Whats Fresh",
            "slug": "wf",
            "owner": 2,
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