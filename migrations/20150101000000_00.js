'use strict';

exports.up = function(knex, Promise) {
   return knex.schema.createTable('projects', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('uri');
    table.integer('owner').references('id').inTable('users').notNullable();
  }).createTable('checkins', function (table) {
    table.increments('id').primary();
    table.integer('duration').notNullable();
    table.integer('user').references('id').inTable('users').notNullable();
    table.integer('project').references('id').inTable('projects').notNullable();
    table.integer('activity').references('id').inTable('activity').notNullable();
    table.string('notes');
    table.string('issue_uri');
    table.timestamp('date_worked');
    table.timestamps();
  }).createTable('activities', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
  }).createTable('users', function (table) {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
  }).createTable('slugs', function (table) {
    table.increments('id').primary();
    table.string('slug').unique().notNullable();
    table.integer('activity').references('id').inTable('activities');
    table.integer('project').references('id').inTable('projects');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('projects');
};
