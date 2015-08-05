// src/helpers.js

var app = require('./app');
var knex = app.get('knex');
var errors = require('./errors');

module.exports = {
    checkActivities: function(names) {
        //console.log('Names:', names);
        return new Promise(function(resolver, reject){
            knex('activities').where('slug', 'in', names).then(function(slugs){
                if(names == undefined){
                    console.log('Rejecting 1');
                    reject(names);
                }
                else{
                    var results = slugs.map(function(value){
                        return value.slug;
                    });
                    console.log('Results:', results);
                    var unmatched = names.filter(function(value){
                        /*
                        if(value == null){
                            console.log('Rejecting 2');
                            reject(null);
                        }
                        */
                        if(results.indexOf(value) < 0){
                            console.log('Filtering:', value);
                            return value;
                        }
                    });
                    console.log('Unmatched:', unmatched);
                    var ids = slugs.map(function(value){
                        return value.id;
                    });
                    //console.log('Ids:', ids);
                    //console.log('Slugs:', slugs);
                    if(unmatched.length == 0){
                        resolver(ids);
                    }
                    else{
                        reject(unmatched);
                    }
                }
            });
        });

        



            //console.log(names);
            /**
            if (names === undefined){
                console.log('Reject');
                reject(names);
            }
            else{
                var valid = [];
                var invalid = [];
                var ids = [];
                for (var i = 0; i < names.length; i++){
                    console.log(names[i], i);
                    /**
                    if(names[i] === undefined || names[i] === null){
                        console.log('invalid');
                        invalid.push(names[i]); 
                        continue;
                    }
                    new Promise(function(resolver, reject){
                        knex('activities').where({slug:names[i]}).then(function(slug){
                           console.log(slug, names[i], i);
                           if (slug == undefined){
                               invalid.push(names[i]);
                           }
                           else if (names[i] == slug[0].slug){
                               valid.push(slug[0].id);
                               console.log('Valid slug found for ' + slug);
                           }
                           ids.push(slug[0].id);
                           console.log('Ids:', ids);
                           console.log('Valid:', valid);
                           if (valid == names.length - 1){
                               console.log('Valid slugs');
                               resolver(valid);
                           };
                        });

                    });
                };
                //reject(names);
            }
            */
    }
};
