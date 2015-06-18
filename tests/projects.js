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

  describe('POST /projects/add', function() {
    options = {
      baseUrl: base_url,
      uri: '/projects/add',
      method: 'POST',
      headers: {name: 'content-type', value: 'application/json'},
      followAllRedirects: true
    };
    it ('should successfully add a project', function(done) {
      options.json = {
        "uri": "https://github.com/osuosl-cookbooks/python-webapp",
        "name": "Python Webapp",
        "slugs": ["python-webapp", "python-webapp-cookbook"],
        "owner": "tschuy"
      }
      request(options, function(err, res, body) {
        var expected_result = {
          "uri": "https://github.com/osuosl-cookbooks/python-webapp",
          "name": "Python Webapp",
          "slugs": ["python-webapp", "python-webapp-cookbook"],
          "owner": "tschuy",
          "id": 4
        };
        expected_result.slugs.sort();
        res.body.slugs.sort();

        expect(err === null);
        expect(res.statusCode).to.be(200);

        expect(res.body).to.eql(expected_result);
        done();
      });
    });

    it ('should fail if user does not exist', function(done){
      options.json = {
        "uri": "https://github.com/osuosl-cookbooks/python-webapp",
        "name": "Python Webapp",
        "slugs": ["python-webapp", "python-webapp-cookbook"],
        "owner": "nonexistent"
      };
      request(options, function(err, res, body) {
        var expected_result = {
          'error': "The provided slug wasn't valid",
          'errno': 6,
          'text': "nonexistent is not a valid username"
        };

        expect(res.body).to.eql(expected_result);
        expect(res.statusCode).to.equal(400);

        done();
      });
    });

    it ('should fail if slug already exists', function(done){
      options.json = {
        "uri": "https://github.com/osuosl-cookbooks/python-webapp",
        "name": "Python Webapp",
        "slugs": ["python-webapp", "python-webapp-cookbook", "gwm"],
        "owner": "tschuy"
      };
      request(options, function(err, res, body) {
        var expected_result = {
          'error': "The provided slug already exists",
          'errno': 7,
          'text': 'slug gwm is already in use'
        };

        expect(res.body).to.eql(expected_result);
        expect(res.statusCode).to.equal(400);

        done();
      });
    });
  });
};