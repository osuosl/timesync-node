module.exports = function(expect, request, base_url) {
  describe('GET /times', function() {
    it ('should return all times in the database', function(done) {
      request.get(base_url + 'times', function(err,
          res, body) {
        var bodyAsString = String.fromCharCode.apply(null, res.body);
        var expected_results = [
          {
            "duration": 12,
            "user": "tschuy",
            "project": ["wf"],
            "activity": ["dev"],
            "notes": "",
            "issue_uri": "https://github.com/osu-cass/whats-fresh-api/issues/56",
            "date_worked": null,
            "created_at": null,
            "updated_at": null,
            "id": 1
          }
        ];
        expect(err === null);
        expect(res.statusCode).to.be(200);
        expect(JSON.parse(bodyAsString)).to.eql(expected_results);
        done();
      });
    });
  });
};