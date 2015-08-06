TimeSync-Node
==============

![travis](https://travis-ci.org/osuosl/timesync-node.svg?branch=develop) [![Dependency Status](https://david-dm.org/osuosl/timesync-node.svg)](https://david-dm.org/osuosl/timesync-node)

<img align="right" style="padding: 5px;" src="/timesync-node.png?raw=true" />

TimeSync is the OSU Open Source Lab's time tracking system. It's designed to be
simple, have a sane API, and make sense while allowing users to track their
time spent on various projects and activities.

Usage
-----

To start a local instance running on port 8000, just run:

```
$ npm install
$ npm run devel
```

``npm run devel`` is a convenience that will automatically restart the server
every time source files are changed. The standard ``npm start`` still works,
and will not restart the server automatically.

To run the test suite and linter run:

```
$ npm test
$ npm run linter
```

To make a quick request on the dev instance, first run the database migrations
and load the fixtures:

```
$ npm run migrations
$ npm run fixtures
```

Next, run the application:

```
$ npm start
```

Then, in another terminal, make a request to the application with curl.

(*Piping it to python makes the output pretty.*)

```
$ curl -XGET -s localhost:8000/v1/times | python -m json.tool
[
    {
        "activity": [
            "dev"
        ],
        "created_at": null,
        "date_worked": null,
        "duration": 12,
        "id": 1,
        "issue_uri": "https://github.com/osu-cass/whats-fresh-api/issues/56",
        "notes": "",
        "project": [
            "wf"
        ],
        "updated_at": null,
        "user": "tschuy"
    }
]

```

Your output should look something like the above.

Documentation
-------------

More in-depth documentation can be found inside the ``docs/`` folder. To build
the docs, build them with sphinxdocs by running the following:

```
$ pip install -r requirements.txt
$ cd docs
[docs]$ make html
[docs]$ <browser> build/html/index.html
```

API Specification
------------------

The API docs are a git submodule. Before building them you need to initialize
the submodule with the following commands:

```
The following command initializes the empty submodule:
$ git submodule update --init timesync-api
The following command updates the submodule (when the remote repo gets updated):
$ git submodule update timesync-api
```

To build the api specification docs run the following commands (it is very
similar to building the timesync-node docs):

```
$ pip install -r requirements.txt
$ cd timesync-api
[timesync-api]$ make html
[timesync-api]$ <browser> build/html/index.html
```
