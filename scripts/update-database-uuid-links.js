'use strict';

const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';

// Load the database (default = development)
const knex = require('knex')(knexfile[db]);

// Run this all in a transaction so if any errors occur we can just rollback
knex.transaction(function(trx) {
  /*
   * First add the UUID fields, so we can migrate the data.
   */
  trx.schema.table('times', function(times) {
    times.uuid('project_uuid');
  }).then(function() {
    trx.schema.table('projects', function(projects) {
      projects.uuid('default_activity_uuid');
    }).then(function() {
      /*
       * Now migrate the ID fields to UUIDs.
       */
      trx('times').update('times.project_uuid', 'projects.uuid')
      .innerJoin('projects', 'projects.id', 'times.project').then(function() {
        trx('times').update('projects.default_activity_uuid', 'activities.uuid')
        .innerJoin('activities', 'activities.id', 'projects.default_activity')
        .then(function() {
          /*
           * Now delete the old ID fields.
           */
          trx.schema.table('times', function(times) {
            times.dropColumn('project');
          }).then(function() {
            trx.schema.table('projects', function(projects) {
              projects.dropColumn('default_activity');
            }).then(function() {
              /*
               * Finally rename UUID fields to take place of ID fields.
               */
              trx.schema.table('times', function(times) {
                times.renameColumn('project_uuid', 'project');
              }).then(function() {
                trx.schema.table('projects', function(projects) {
                  projects.renameColumn('default_activity_uuid',
                                        'default_activity');
                }).then(function() {
                  console.log('Success! Data has been migrated!');
                  process.exit(0);
                }).catch(function(error) {
                  console.error('Error moving projects UUID field: ' + error);
                  trx.rollback();
                });
              }).catch(function(error) {
                console.error('Error moving times UUID field: ' + error);
                trx.rollback();
              });
            }).catch(function(error) {
              console.error('Error removing projects ID field: ' + error);
              trx.rollback();
            });
          }).catch(function(error) {
            console.error('Error removing times ID field: ' + error);
            trx.rollback();
          });
        }).catch(function(error) {
          console.error('Error migrating projects to UUID: ' + error);
          trx.rollback();
        });
      }).catch(function(error) {
        console.error('Error migrating times to UUID: ' + error);
        trx.rollback();
      });
    }).catch(function(error) {
      console.error('Error adding activity UUID field to projects: ' + error);
      trx.rollback();
    });
  }).catch(function(error) {
    console.error('Error adding project UUID field to times: ' + error);
    trx.rollback();
  });
}).catch(function() {
  console.error('Rolling back transaction. No changes have occured.');
  process.exit(-1);
});
