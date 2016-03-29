.. _models:

===========
Data Models
===========

Below are the database models to be used in TimeSync.

Projects:
---------

================ ====================================================
Name             Type/Description
================ ====================================================
id               auto-incrementing integer primary key
name             string
uri              nullable string
default_activity foreign key to Activity id
uuid             UUID string unique to revision set
revision         integer
newest           bool
created_at       integer representing millisecond epoch time
updated_at       nullable integer representing millisecond epoch time
deleted_at       nullable integer representing millisecond epoch time
================ ====================================================

ProjectSlugs:
-------------

======= =====================================
Name    Type/Description
======= =====================================
id      auto-incrementing integer primary key
project foreign key to Project id
slug    string
======= =====================================

Activities:
-----------

========== ====================================================
Name       Type/Description
========== ====================================================
id         auto-incrementing integer primary key
name       string
slug       string
uuid       UUID string unique to revision set
revision   integer
newest     bool
created_at integer representing millisecond epoch time
updated_at nullable integer representing millisecond epoch time
deleted_at nullable integer representing millisecond epoch time
========== ====================================================

Times:
---------

=========== ====================================================
Name        Type/Description
=========== ====================================================
id          auto-incrementing integer primary key
project     foreign key to Project id
duration    number of seconds
user        foreign key to User id
activity    foreign key to Activity id
notes       nullable string
issue_uri   nullable string
date_worked integer representing millisecond epoch time
newest      bool
uuid        UUID string unique to revision set
revision    integer
newest      bool
created_at  integer representing millisecond epoch time
updated_at  nullable integer representing millisecond epoch time
deleted_at  nullable integer representing millisecond epoch time
=========== ====================================================

User:
-----

============== ====================================================
Name           Type/Description
============== ====================================================
id             auto-incrementing integer primary key
username       unique string
password       bcrypt hash
display_name   nullable string
email          nullable string
active         bool
site_spectator bool
site_manager   bool
site_admin     bool
meta           nullable string
created_at     integer representing millisecond epoch time
updated_at     nullable integer representing millisecond epoch time
deleted_at     nullable integer representing millisecond epoch time
============== ====================================================
