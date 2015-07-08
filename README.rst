TimeSync
========

.. image:: https://travis-ci.org/osuosl/timesync.svg?branch=develop
    :target: https://travis-ci.org/osuosl/timesync

TimeSync is the `OSU Open Source Lab's`_ time tracking system. It's designed to
be simple, have a sane API, and make sense while allowing users to track their
time spent on various projects and activities.

<img align="right" style="padding: 5px;" src="/timesync.png?raw=true" />

.. _OSU Open Source Lab's: http://osuosl.org/

Usage
-----

To start a local instance running on port 8000, just run:

.. code:: none

    $ npm install
    $ npm start

Documentation
-------------

In-depth documentation can be found inside the ``docs/`` folder.

The docs are written with `sphinx`_ and can be built by running the following:

.. code:: none

    $ virtualenv venv
    $ pip install sphinx
    $ soruce venv/bin/activate
    $ cd docs/
    [docs] $ make html
        Wait a little bit...
    [docs] $ <your browswer of choosing> build/html/index.html

.. _sphinx: http://sphinx-doc.org/
