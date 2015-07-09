module.exports = function(app) {
    app.get(app.get('version') + '/', function (req, res) {
        res.send('hello javascript');
    });

    app.post(app.get('version') + '/', function (req, res) {
        res.send('hello javascript');
    });
};
