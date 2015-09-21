.. _development:

===============
Developer Guide
===============

Setup
-----

There are a few system requirements for installing a node-based application --
namely, node itself and npm, its package manager. As TimeSync uses node v0.12,
it is necessary on Debian and CentOS to get it from either a `3rd party repo`_,
or install the binary manually.

.. _`3rd party repo`: https://nodesource.com/blog/nodejs-v012-iojs-and-the-nodesource-linux-repositories

.. note::

   To check if your system already has a compatible version installed, run
   ``node --version``. If your version is ``v0.12`` or above, you're good to
   go.

To install it manually, download the binary from nodejs.org, extract it, and
add its ``bin/`` directory to the system's PATH::

    $ curl -O https://nodejs.org/dist/v0.12.6/node-v0.12.6-linux-x64.tar.gz
    $ tar -xzf node-v0.12.6-linux-x64.tar.gz
    $ echo "PATH=$PATH:`pwd`/node-v0.12.6-linux-x64/bin" >> ~/.bashrc
    $ source ~/.bashrc
    $ node --version
    v0.12.6

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

    npm run devel

.. note:: ``npm run devel`` uses the ``nodemon`` tool to automatically restart your
    test server when files are changed. To run TimeSync in production, use
    ``npm start``.

TimeSync can now be accessed on ``http://localhost:8000``, or the port
specified in console output if appropriate.

Some other commands have been made available through TimeSync's
``package.json`` for convenience:

    * ``npm run recreate``: destroy the database and re-run migrations
    * ``npm run linter``: run the jshint Javascript linter
    * ``npm run fixtures``: install a set of test fixtures

Databases
---------

TimeSync supports multiple kinds of database connections. For testing, it uses a
``SQLite`` database in-memory, for development, it uses a ``SQLite`` database on
the filesystem, and in production, it uses a ``PostgreSQL`` database. Since it's
not a good idea to use a totally different database server without testing it
first, it's a good idea to make sure your changes work on Postgres as well.

To use the Postgres database, first set your ``NODE_ENV`` to ``production``::

    $ export NODE_ENV="production"

Then, set the ``PG_CONNECTION_STRING`` environment variable to a Postgres
connection string, which looks something like this::

    $ export PG_CONNECTION_STIRNG="postgres://username:password@server:port/db_name"

For instance, if you're running an instance of Postgres locally with the
username and password ``timesync`` accessing the database ``timesync``, the
string should look like this::

    postgres://timesync:timesync@localhost:5432/timesync

Testing
-------

TimeSync comes with a single command to run the tests, linters, and test
coverage commands all at once. It's Latte, or *Lint and Throughly Test
Everything*::

    npm run latte

To only test the application, use the test command::

    npm test

You can select which subset of tests to run using pattern matching::

    npm test -- -g POST

This will only run tests which are within a ``describe('.*POST.*', function()
{`` or ``it('.*POST.*'), function() {`` block (where ``.*POST.*`` is a regular
expression.  Essentially the ``-g`` syntax can be treated as a fuzzy-search
where only tests wrapped in a block with the substring you enter are run).

TimeSync uses Mocha for testing. See `its documentation`_ for more information
on how to write tests, or use the tests included in TimeSync as a guide. They
can be found in ``tests/``.

TimeSync test coverage is measured with the `Istanbul`_ package. To run the
tests and measure coverage, run::

    npm run coverage

To see a detailed coverage report, open ``coverage/lcov-report/index.html``.

.. _Istanbul: https://github.com/gotwarlost/istanbul
.. _`its documentation`: http://mochajs.org/

Code standards
--------------

The TimeSync source code is linted using `JSHint`_. This helps keep the code
base cleaner and more readable. For the most part, if an error occurs, it is
straightforward to fix it. For reference, a full list of messages is available
in the `JSHint source code`_.

To run the linter, just run::

    npm run linter

.. _`JSHint`: https://github.com/jshint/jshint
.. _`JSHint source code`: https://github.com/jshint/jshint/blob/master/src/messages.js


Travis CI
---------

Every time a commit is pushed to GitHub, Travis CI will automatically run the
test suite and marks the push as working or not. This is especially helpful
during code review.

Travis runs the test suite and the linter as described above.
