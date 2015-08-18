.. libraries:

=========
Libraries
=========

Below are the most important libraries that TimeSync uses. For a complete list,
see the app's ``package.json`` file.

Express
-------

Express is the biggest Node web framework. Most of a TimeSync developer's
interaction with Express will be through the global ``app``, ``res``, and
``req`` objects that Express sets up on load. For documentation on how to use
these, see the `Express API documentation`_.

.. _Express API documentation: http://expressjs.com/4x/api.html

Knex
----

Knex is a simple, easy-to-use SQL query builder. What this means is that it
constructs database queries in Javascript, without having to rely on string
concatenation and manual query escaping.

The `Knex documentation`_ is super helpful for constructing queries. A simple
query to grab all of the users from the database might look like this:

.. code-block:: javascript

    var knexfile = require('../knexfile');
    var knex = require('knex')(knexfile['development']);
    knex('users').then(function(users) {
        // do things with users
    }).catch(function(error) {
        // something went wrong
    });

Knex uses Bluebird promises. For information on promises in general, see the
`MDN documentation`_ on promises. For how to use Bluebird promises specifically,
see `Bluebird's README`_.

.. _Knex documentation: http://knexjs.org/
.. _MDN documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
.. _Bluebird's README: https://github.com/petkaantonov/bluebird#introduction

Mocha and Chai
--------------

Mocha is the test runner used in TimeSync. It runs tests one-by-one and tracks
which one throws exceptions, which allows it to run with any number of testing
libraries. TimeSync uses the Chai assertion library, which allows us to use
plugins like ``chai-passport-strategy`` to make our tests simpler.

TimeSync uses mostly Chai's ``expect`` paradigm when running tests. This allows
tests to be read almost like English:

.. code-block:: javascript

    expect(foo).to.be.a('string');
    expect(bar).to.deep.equal(baz);

Both Chai and Mocha have excellent documentation:

* `Mocha documentation`_
* `Chai documentation`_
* `Chai's expect documentation`_

.. _Mocha documentation: http://mochajs.org/
.. _Chai documentation: http://chaijs.com/
.. _Chai's expect documentation: http://chaijs.com/api/bdd/

sql-fixtures
------------

TimeSync has a set of test data stored in ``tests/fixtures`` that is loaded
before every test run. This test data can be used to test deleting, updating,
adding, etc. objects from the database.

To reference foreign keys in fixtures, reference them as ``table_name:index``.
For instance, for a table ``wugs`` that references ``quirks``, if the fixtures
contain a list of three ``quirks``, and you want to reference the second, you
can set the ``quirk`` field of the ``wug`` to ``"quirk": "quirks:1"``.

.. warning::

    It's important to note that ``sql-fixtures``'s foreign key resolution
    doesn't refer to the ID of the object in the database, but instead its index
    in the zero-indexed list of objects to be added.

For more information, see the `node-sql-fixtures documentation`_.

.. _node-sql-fixtures documentation: http://city41.github.io/node-sql-fixtures/

Using additional fixtures
~~~~~~~~~~~~~~~~~~~~~~~~~

Every test is run from within two ``describe()`` statements -- the first being
the category (``Endpoint``, ``Helper``, etc), and the second the thing being
tested (``GET wugs/``, ``checkActivity``, etc). Each ``describe()`` can have
its own ``beforeEach``.

To override the set of fixtures that is being installed for a group of tests,
add a ``beforeEach`` section to the test's ``describe()`` statement:

 .. code-block:: javascript

    describe('GET /wugs', function() {

        var SqlFixtures = require('sql-fixtures');
        var fixtureCreator = new SqlFixtures(knex);
        var testData = require('./fixtures/super_awesome_fixtures');

        beforeEach(function(done) {
            fixtureCreator.create(testData).then(function() {
                done();
            });
        });

        it('tests the thing', function(done) {
            // expect the thing
        });
    });

Note that the child ``beforeEach`` will be run after the main ``beforeEach``,
so any tests done inside the ``GET /wugs`` block above will have not only the
``super_awesome_fixtures`` loaded above but the ``test_data`` fixtures loaded
by ``tests/test.js``.

Passport
--------

Passport is an authentication middleware for Node. It uses a Strategy system,
where each strategy is a different way to authenticate a user. These can be
things like username/password, OpenID, oAuth, etc. (For a full list, see the
`Passport homepage`_ -- there are hundreds.) The `Passport documentation`_
is available there as well.

To use a strategy, it can be loaded with ``passport.use``:

.. code-block:: javascript

    // app.js
    var localPassport = require('./auth/local.js')(knex);
    passport.use(localPassport);

.. _Passport homepage: http://passportjs.org/
.. _Passport documentation: http://passportjs.org/docs

Passport Local
--------------

Currently, TimeSync is set up to use ``passport-local`` to do username/password
authentication. To use ``passport-local``, create a new LocalStrategy with a
function taking the username, password, and ``done`` callback. Your job is then
to check if the username and password match what's in the database. When you've
finished checking, the ``done`` callback can be called.

The ``done`` callback takes three parameters:
  * ``err``: if this is not null, Passport will error
  * ``user``: the successfully authenticated user
  * ``information``: an optional block of information

In pseudocode, a LocalStrategy might look something like this:

.. code-block:: javascript

    var LocalStrategy = require('passport-local').Strategy;
    var strategy = new LocalStrategy(
      function(username, password, done) {
        // get user from database
        knex( /* get user */ ).then(function(user) {
          if( /* user is correct */ ) {
            done(null, user);
          } else {
            done(null, false, {'message': 'Failed authentication'});
          }
        }).catch(function(err) {
          done(err); // we don't know what went wrong
        });
      });
    });

External Resources
------------------

* `Knex documentation`_

Promises
~~~~~~~~
* `MDN documentation`_
* `Bluebird's README`_

Testing
~~~~~~~
* `Mocha documentation`_
* `Chai documentation`_
* `Chai's expect documentation`_
* `node-sql-fixtures documentation`_

Authentication
~~~~~~~~~~~~~~
* `Passport documentation`_
* `Passport homepage`_
