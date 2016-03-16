#!/bin/bash

# Echo a string to stderr instead of stdout
err_echo() {
  >&2 echo "$@";
}

nvm install 4.2 || err_echo "NVM is not installed. Install NVM, or install Node v4.2 manually."

if ! npm install; then
  err_echo "'npm install' failed! Make sure Node is installed and available on this machine!"
  exit 1
fi

if [ -z "$PG_CONNECTION_STRING" -a -z "$MYSQL_CONNECTION_STRING" -a -z "$SQLITE_CONNECTION_FILE" ]; then
  echo -n "What database will you be using? [mysql, postgresql, sqlite]: "
  read DATABASE

  if [ "$DATABASE" == "mysql" ]; then
    read -p "MySQL user: " MYSQL_USER
    read -p "MySQL password: " MYSQL_PASSWORD
    read -p "MySQL hostname: " MYSQL_HOST
    read -p "MySQL port: " MYSQL_PORT
    read -p "MySQL database: " MYSQL_DB
    export MYSQL_CONNECTION_STRING="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}"
    export NODE_ENV="production_mysql"
  elif [ "$DATABASE" == "postgresql" -o "$DATABASE" == "postgres" -o "$DATABASE" == "pg" ]; then
    read -p "PostgreSQL user: " PG_USER
    read -p "PostgreSQL password: " PG_PASSWORD
    read -p "PostgreSQL hostname: " PG_HOST
    read -p "PostgreSQL port: " PG_PORT
    read -p "PostgreSQL database: " PG_DB
    export PG_CONNECTION_STRING="postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB}"
    export NODE_ENV="production_pg"
  elif [ "$DATABASE" == "sqlite" ]; then
    read -p "SQLite filename: " SQLITE_FILE
    if [ ! -r $SQLITE_FILE ]; then
      err_echo "File is not readable. Check permissions."
      exit 1
    else
      export SQLITE_CONNECTION_FILE="$SQLITE_FILE"
      export NODE_ENV=production_sqlite
    fi
  else
    err_echo "Database unsupported."
  fi
elif [ -n "$PG_CONNECTION_STRING" ]; then
  export NODE_ENV=production_pg
elif [ -n "$MYSQL_CONNECTION_STRING" ]; then
  export NODE_ENV=production_mysql
elif [ -n "$SQLITE_CONNECTION_FILE" ]; then
  export NODE_ENV=production_sqlite
fi

if ! npm run migrations; then
  err_echo "Error running migrations! Check that your database is running and your credentials are correct."
  exit 1
fi

if ! npm run create-account; then
  err_echo "Account creation failed. Please try again."
  exit 1
fi

echo "Your database has been set up, and you have a root user."
echo "TimeSync-Node does not at this time support storing your configuration."
echo "Therefore, you must provide these credentials in the run command."
echo "To run timesync, please run:"
echo
echo -n "'NODE_ENV=${NODE_ENV} "
if [ "$NODE_ENV" == "production_mysql" ]; then
  echo -n "MYSQL_CONNECTION_STRING=\"${MYSQL_CONNECTION_STRING}\" "
elif [ "$NODE_ENV" == "production_pg" ]; then
  echo -n "PG_CONNECTION_STRING=\"${PG_CONNECTION_STRING}\" "
elif [ "$NODE_ENV" == "production_sqlite" ]; then
  echo -n "SQLITE_CONNECTION_FILE=\"${SQLITE_CONNECTION_FILE}\" "
fi
echo "INSTANCE_NAME=<instance_name> SECRET_KEY=<secret_key> npm start'"
echo
echo "See the TimeSync-Node documentation for other configuration options."
