#!/bin/bash
docker-compose run -d db
psql postgres://postgres:postgres@localhost:5432 --command="CREATE DATABASE timesync;"
export PG_CONNECTION_STRING=postgres://postgres:postgres@localhost:5432/timesync
npm run migrations
npm test
