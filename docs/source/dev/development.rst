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

TimeSync comes with a very basic Gruntfile that automatically restarts the
server whenever files in ``src/`` are changed. To start Grunt, just run::

    npm run grunt

For more information on Grunt, see Grunt's `Getting Started guide`_.

Alternatively, if you don't want to use Grunt, you can use Node's built-in
runner::

    npm start

TimeSync can now be accessed on ``http://localhost:8000``, or the port
specified in console output if appropriate.

Some other commands have been made available through TimeSync's
``package.json`` for convenience:

    * ``npm run recreate``: destroy the database and re-run migrations
    * ``npm run linter``: run the jshint Javascript linter
    * ``npm run fixtures``: install a set of test fixtures

.. _`Getting Started guide`: http://gruntjs.com/getting-started


Testing
-------

TimeSync comes with a single command to run the tests, linters, and test
coverage commands all at once. It's Latte, or *Lint and Throughly Test
Everything*::

    npm run latte

To only test the application, use the test command::

    npm test

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
