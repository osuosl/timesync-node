'use strict';

/*
 * DATABASE MIGRATION SCRIPT
 * SUMMARY: Update times.project and projects.default_activity to use UUIDs.
 * DATE: 2016-10-05
 * AUTHOR: Tristan Patch <patcht@osuosl.org>
 *
 * REASON: At this time, times reference their associated projects by ID, and
 *   projects reference their default activity by ID. However, the update end-
 *   point for projects and activities does not update these references, causing
 *   times to appear to be "lost" or deleted whenever a project is updated, as
 *   the times refer to old versions of projects.
 *
 *   Rather than change the endpoints to update these ID references, it was
 *   decided that it would be more consistent and future-proof to change the
 *   schema of these objects to use UUID references, which identify an object
 *   across updates, rather than a single revision of the object. The codebase
 *   was updated to use these UUID references, and the migrations file which
 *   creates the database was updated. This script exists to migrate existing
 *   data in a database to reflect these changes.
 *
 * EXPLANATION:
 *   This script performs the change in four steps:
 *      1. Add times.project_uuid and projects.default_activity_uuid columns
 *      2. Set the value of times.project_uuid to the UUID of the object which
 *            has the same ID as in times.project, and similarly for
 *            projects.default_activity_uuid. See the comment within the code
 *            for more information about the exact query used to do this.
 *      3. Delete times.project and projects.default_activity
 *      4. Rename times.project_uuid to times.project and
 *            projects.default_activity_uuid to projects.default_activity
 *
 *   The end result is that the type of times.project is changed from a number
 *   to a UUID, and the same for projects.default_activity, and that the values
 *   in these columns is changed to follow suit, causing no loss of data during
 *   this migration.
 */

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
    times.uuid('project_uuid'); // Add `project_uuid` column to times
  }).then(function() {
    trx.schema.table('projects', function(projects) {
      projects.uuid('default_activity_uuid'); // Add `default_activity_uuid`
    }).then(function() {
      /*
       * Now migrate the ID fields to UUIDs.
       */

      /*
       * This is a bit of a weird SQL query, I admit. I didn't know you could
       * join on an update query. The equivalent SQL is as follows:
       *
       * UPDATE
       *    times
       * SET
       *    times.project_uuid = projects.uuid
       * FROM
       *    times
       *  JOIN
       *      projects
       *    ON
       *        projects.id = times.project
       *
       * So we basically take each time, look up the project that times.project
       * (the ID field) references, get that project's UUID, and put that back
       * into times.project_uuid. This is the actual query that migrates us from
       * ID references to UUID references.
       */
      trx('times').update('times.project_uuid', 'projects.uuid')
      .innerJoin('projects', 'projects.id', 'times.project').then(function() {
        /*
         * And now we do the exact same thing for projects. The SQL query, once
         * again, is as follows:
         *
         * UPDATE
         *    projects
         * SET
         *    projects.default_activity_uuid = activities.uuid
         * FROM
         *    projects
         *  JOIN
         *      activities
         *    ON
         *        activities.id = projects.default_activity
         *
         * So, once again, we take each project, look up its default activity
         * by ID, get that activity's UUID, and put that back into
         * projects.default_activity_uuid.
         */
        trx('times').update('projects.default_activity_uuid', 'activities.uuid')
        .innerJoin('activities', 'activities.id', 'projects.default_activity')
        .then(function() {
          /*
           * Now delete the old ID fields.
           */
          trx.schema.table('times', function(times) {
            // Remove the times.project column, leaving only times.project_uuid
            times.dropColumn('project');
          }).then(function() {
            trx.schema.table('projects', function(projects) {
              // Remove projects.default_activity, leaving ""_uuid
              projects.dropColumn('default_activity');
            }).then(function() {
              /*
               * Finally rename UUID fields to take place of ID fields.
               */
              trx.schema.table('times', function(times) {
                // Move times.project_uuid to times.project
                times.renameColumn('project_uuid', 'project');
              }).then(function() {
                trx.schema.table('projects', function(projects) {
                  // projects.default_activity_uuid -> projects.default_activity
                  projects.renameColumn('default_activity_uuid',
                                        'default_activity');
                }).then(function() {
                  /*
                   * We have now effectively replaced the columns containing an
                   * ID reference to those containing a UUID reference. The
                   * old ID columns are no more, and the UUID columns have the
                   * same name.
                   */
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
  /*
   * If any errors occured during the script's operation, they would be caught
   * by one of the above catch() functions, which would print out an error, then
   * call trx.rollback(). This means that no changes will be pushed to the
   * database, and it will be as if this script was never run at all. The error
   * can then be corrected, and the script re-run, without concern for the
   * database's sanity.
   */
  console.error('Rolling back transaction. No changes have occured.');
  process.exit(-1);
});
