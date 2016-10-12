'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.string('display_name');
    table.string('email');
    table.boolean('site_spectator').defaultTo(false);
    table.boolean('site_manager').defaultTo(false);
    table.boolean('site_admin').defaultTo(false);
    table.boolean('active').defaultTo(true);
    table.bigInteger('created_at').notNullable();
    table.bigInteger('updated_at').defaultTo(null);
    table.bigInteger('deleted_at').defaultTo(null);
    table.text('meta');
  }).createTable('activities', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug');
    table.bigInteger('created_at').notNullable();
    table.bigInteger('updated_at').defaultTo(null);
    table.bigInteger('deleted_at').defaultTo(null);
    table.uuid('uuid').notNullable();
    table.integer('revision').defaultTo(1);
    table.boolean('newest').defaultTo(true);
  }).createTable('projects', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('uri');
    table.uuid('default_activity');
    table.bigInteger('created_at').notNullable();
    table.bigInteger('updated_at').defaultTo(null);
    table.bigInteger('deleted_at').defaultTo(null);
    table.uuid('uuid').notNullable();
    table.integer('revision').defaultTo(1);
    table.boolean('newest').defaultTo(true);
  }).createTable('times', function(table) {
    table.increments('id').primary();
    table.integer('duration').notNullable();
    table.integer('user').references('id').inTable('users').notNullable()
      .onDelete('restrict');
    table.uuid('project').notNullable();
    table.string('notes');
    table.string('issue_uri');
    table.bigInteger('date_worked').notNullable();
    table.bigInteger('created_at').notNullable();
    table.bigInteger('updated_at').defaultTo(null);
    table.bigInteger('deleted_at').defaultTo(null);
    table.uuid('uuid').notNullable();
    table.integer('revision').defaultTo(1);
    table.boolean('newest').defaultTo(true);
  }).createTable('projectslugs', function(table) {
    table.increments('id').primary();
    table.string('name').unique().notNullable();
    table.integer('project').references('id').inTable('projects').notNullable()
      .onDelete('cascade');
  }).createTable('timesactivities', function(table) {
    table.increments('id').primary();
    table.integer('time').references('id').inTable('times').notNullable()
      .onDelete('cascade');
    table.integer('activity').references('id').inTable('activities')
      .notNullable().onDelete('cascade');
  }).createTable('userroles', function(table) {
    table.increments('id').primary();
    table.integer('project').references('id').inTable('projects').notNullable()
      .onDelete('cascade');
    table.integer('user').references('id').inTable('users').notNullable()
      .onDelete('cascade');
    table.boolean('manager').defaultTo(false);
    table.boolean('member').defaultTo(false);
    table.boolean('spectator').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
