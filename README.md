TimeSync
========

![travis](https://travis-ci.org/osuosl/timesync.svg?branch=develop)

<img align="right" style="padding: 5px;" src="/timesync.png?raw=true" />

TimeSync is the OSU Open Source Lab's time tracking system. It's designed to be
simple, have a sane API, and make sense while allowing users to track their
time spent on various projects and activities.

Usage
-----

To start a local instance running on port 8000, just run:

```
$ npm install
$ npm start
```

Documentation
-------------

More in-depth documentation can be found inside the ``docs/`` folder.

To build the docs install sphinx and run ``make html``

```
$ virtualenv venv
$ source venv/bin/activate
$ pip install sphinx
$ cd docs
[docs]$ make html
    Wait a while... 
[docs]$ <browser> build/html/index.html
```
