.. _development:

===============
Developer Guide
===============

Setup
-----

There are a few system requirements for installing a node-based application --
namely, node itself and npm, its package manager. These dependencies can be
installed on a Debian system with the following::

    sudo apt-get install nodejs npm nodejs-legacy

After installation of the system dependencies, install the project-specific
requirements using ``npm`` in the root of the project repository::

    npm install

Congratulations, TimeSync is ready for development!


Running TimeSync
----------------

At this point, all of the requirements for TimeSync have been installed. Now,
run the migrations::

    npm run migrations

And run the server::

    npm start

You can now access TimeSync on ``http://localhost:8000``, or the port specified
in console output if appropriate.

Some other commands have been made available through TimeSync's
``package.json`` for convenience:

    * ``npm run recreate``: destroy the database and re-run migrations
    * ``npm run linter``: run the jshint Javascript linter
    * ``npm run fixtures``: install a set of test fixtures

Testing
-------

To test the application, use the test command::

    npm test

TimeSync uses Mocha for testing. See `its documentation`_ for more information
on how to write tests, or use the tests included in TimeSync as a guide. They
can be found in ``tests/``.

.. _`its documentation`: http://mochajs.org/