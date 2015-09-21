.. _dockerdb:

======================
Developing with Docker
======================

Due to some constraints imposed by SQlite, the TimeSync-Node's testing database
is contained and managed inside a (PostgreSQL) Docker container. For now, each
dev will be developing/testing with their own local instance of the database.

---------------

Testing with a PostgreSQL Database
----------------------------------

There are a few key things to do before you can start testing and developing
with a postgres database.

  1. First and foremost, you'll need to set the environment variable to a
     Postgres connection string::
      
      export PG_CONNECTION_STRING=postgres://[user]:[password]@localhost:5432/[database_name] 

  2. Then access the postgres interactive terminal by running::

      psql postgres://[user]:[password]@localhost:5432

  3. Once there, run ``CREATE DATABASE timesync;`` to create the timesync
     database.

Now you're ready to start testing!

.. note:: 
    Before every new test run, remember to destroy and recreate the database.
    You can do this with ``DESTROY DATABASE timesync; CREATE DATABASE timesync;``
    
