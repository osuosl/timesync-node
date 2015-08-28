'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
    table.string('active').defaultTo(true);
    table.string('password')
  }).createTable('projects', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('uri');
    table.integer('owner').references('id').inTable('users').notNullable();
  }).createTable('times', function(table) {
    table.increments('id').primary();
    table.integer('duration').notNullable();
    table.integer('user').references('id').inTable('users').notNullable();
    table.integer('project').references('id').inTable('projects').notNullable();
    table.string('notes');
    table.string('issue_uri');
    table.bigInteger('date_worked').notNullable();
    table.bigInteger('created_at').notNullable();
    table.bigInteger('updated_at').defaultTo(-1);
  }).createTable('activities', function(table) {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.string('slug').unique().notNullable();
  }).createTable('projectslugs', function(table) {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.integer('project').references('id').inTable('projects').notNullable();
  }).createTable('timesactivities', function(table) {
    table.increments('id').primary();
    table.integer('time').references('id').inTable('times').notNullable();
    table.integer('activity').references('id')
      .inTable('activities').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
