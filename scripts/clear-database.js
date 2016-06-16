'use strict';

const knexfile = require('../knexfile');
const db = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexfile[db]);

const deletePromises = [
  knex('projects').del(),
  knex('activities').del(),
  knex('users').del(),
  knex('times').del(),
  knex('projectslugs').del(),
  knex('timesactivities').del(),
  knex('userroles').del(),
];

Promise.all(deletePromises).then(process.exit).catch(function(error) {
  console.error('Failed to clear database! Error:');
  console.error(error);
  process.exit(1);
});
