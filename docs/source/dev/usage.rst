.. _usage:

===========
Usage Guide
===========

Creating a TimeSync Account
---------------------------

The TimeSync API includes a handy little script to create users. To start it
up, run::

    $ npm run create-account

This will prompt for a username and a password and store the information into
the database.

-----------------


Successful Account Creation
~~~~~~~~~~~~~~~~~~~~~~~~~~~
If things go right, expect to see something like this::

    $ npm run create-account

    > timesync@0.0.0 create-account /home/thai/projects/timesync-node
    > node ./scripts/create-account.js

    prompt: name:  username
    prompt: password:  

    User successfully created

-----------------


Duplicate Username
~~~~~~~~~~~~~~~~~~
However if a username is unavailable, you'll be met with::

    $ npm run create-account

    > timesync@0.0.0 create-account /home/thai/projects/timesync-node
    > node ./scripts/create-account.js

    prompt: name:  username
    prompt: password:  

    INVALID ENTRY: That username is already in use, please choose a different handle

    Exiting... 

In which case, just do as it says - rerun the script and choose a different
username. 

-----------------


Error No. 1
~~~~~~~~~~~
Don't worry too much if you happen upon this next error::
    
    $ npm run create-account

    > timesync@0.0.0 create-account /home/thai/projects/timesync-node
    > node ./scripts/create-account.js

    prompt: name:  username
    prompt: password:  

    Something went wrong! Check out https://www.sqlite.org/c3ref/c_abort.html to figure out what happened.

    Your error number is: 1

    Exiting...

According to SQlite's `result code definitions`_, an errno of 1 is indicative
of either a SQL error or missing database. Odds are (with this script), it's
the latter. To resolve the problem, run::
    
    $ npm run migrations

    > timesync@0.0.0 migrations /home/thai/projects/timesync-node
    > knex migrate:latest

    Using environment: development
    Batch 1 run: 1 migrations 
    /home/thai/projects/timesync-node/migrations/20150101000000_00.js

Recreate your account after the database has been built.

.. _result code definitions: https://www.sqlite.org/c3ref/c_abort.html    
