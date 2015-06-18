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
            "owner": "tschuy",
            "id": 1
          },
          {
            "uri": "https://code.osuosl.org/projects/pgd",
            "name": "Protein Geometry Database",
            "slugs": ["pgd"],
            "owner": "deanj",
            "id": 2
          },
          {
            "uri": "https://github.com/osu-cass/whats-fresh-api",
            "name": "Whats Fresh",
            "slugs": ["wf"],
            "owner": "tschuy",
            "id": 3
          }
        ];

        [expected_results, json_body].forEach(function(list) {
          list.forEach(function(result) {
            result.slugs.sort();
          });
        });

        expect(err === null);
        expect(res.statusCode).to.be(200);

        expect(json_body).to.eql(expected_results);
        done();
      });
    });
  });

  describe('GET /projects/:slug', function() {
    it ('should return projects by slug', function(done) {
      request.get(base_url + 'projects/gwm', function(err, res, body) {
        var json_body = JSON.parse(String.fromCharCode.apply(null, res.body));
        var expected_result = {
            "uri": "https://code.osuosl.org/projects/ganeti-webmgr",
            "name": "Ganeti Web Manager",
            "slugs": ["gwm", "ganeti-webmgr"],
            "owner": "tschuy",
            "id": 1
          };
        expected_result.slugs.sort();
        json_body.slugs.sort();

        expect(err === null);
        expect(res.statusCode).to.be(200);

        expect(json_body).to.eql(expected_result);
        done();
      });
    });

    it ('should fail with invalid slug error', function(done) {
      request.get(base_url + 'projects/404', function(err, res, body) {
        var json_body = JSON.parse(String.fromCharCode.apply(null, res.body));
        var expected_result = {
          "error": "The provided slug wasn't valid",
          "errno": 6,
          "text": "404 is not a valid project slug."
        };

        expect(json_body).to.eql(expected_result);
        expect(res.statusCode).to.equal(404);

        done();
      });
    });
  });
};