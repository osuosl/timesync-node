module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

    //Get all slugs, compare given slug to them
    function checkActivities(name) {
        //name = null;
        var slugs = knex('activityslugs').select('*');

        var valid = 0;
        for (var i = 0; i < slugs.length; i++){
            for (var j = 0; j < name.length; i++) {
                if (name[j] == slugs[i]){
                    valid += 1;
                }
                else if (valid == name.length - 1) {
                    return true;
                }
            }
        }

        return false;
    };

};
