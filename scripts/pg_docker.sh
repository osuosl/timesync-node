###
# POSTGRES_PASSWORD:  timesync
# POSTGRES_USER:      timesync
# POSTGRES_DB:        timesync
# POSTGRES_PORT:      5432
# POSTGRES_CONTAINER: timesync_pg
###

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Setting POSTGRES_PASSWORD"
  POSTGRES_PASSWORD='timesync'
fi

if [ -z "$POSTGRES_USER" ]; then
  echo "Setting POSTGRES_USER"
  POSTGRES_USER='timesync'
fi

if [ -z "$POSTGRES_DB" ]; then
  echo "Setting POSTGRES_DB"
  POSTGRES_DB='timesync'
fi

if [ -z "$POSTGRES_PORT" ]; then
  echo "Setting POSTGRES_PORT"
  POSTGRES_PORT=5432
fi

if [ -z "$POSTGRES_CONTAINER" ]; then
  echo "Setting POSTGRES_CONTAINER"
  POSTGRES_CONTAINER='timesync_pg'
fi

docker version > /dev/null

if [ $? != 0 ]; then
  echo "Please start the docker service"
  echo "\`systemctl start docker\`"
else
  echo docker rm -f $POSTGRES_CONTAINER
  docker rm -f $POSTGRES_CONTAINER

  echo docker run --name=$POSTGRES_CONTAINER \
             -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
             -e POSTGRES_USER=$POSTGRES_USER \
             -e POSTGRES_DB=$POSTGRES_DB \
             -p $POSTGRES_PORT:5432 \
             -d postgres

  docker run --name=$POSTGRES_CONTAINER \
             -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
             -e POSTGRES_USER=$POSTGRES_USER \
             -e POSTGRES_DB=$POSTGRES_DB \
             -p $POSTGRES_PORT:5432 \
             -d postgres
  echo "Starting Postgres Database Container"
  sleep 10
fi
