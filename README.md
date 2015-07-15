TimeSync
========

![travis](https://travis-ci.org/osuosl/timesync.svg?branch=develop)

[![Dependency Status](https://david-dm.org/osuosl/timesync.svg)](https://david-dm.org/osuosl/timesync)

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

To run the test suite and linter run:

```
$ npm test
$ npm run linter
```

More in-depth documentation can be found inside the ``docs/`` folder. To build
the docs, build them with spinxdocs by running the following:

```
$ pip install -r requirements.txt
$ cd docs
[docs]$ make html
[docs]$ <browser> build/html/index.html
```
