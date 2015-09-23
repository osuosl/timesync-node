FROM node:0.12


ENV TIMESYNC_CHECKOUT /opt/timesync-node
ENV NODE_ENV production
ENV PORT 8000
ENV PGUSER postgres
ENV PGPASS pass
ENV PGHOST postgres
ENV PGPORT 5432
ENV PGDATABASE timesync-prod
ENV PG_CONNECTION_STRING postgres://$PGUSER:$PGPASS/$PGHOST:$PGPORT/$PGDATABASE

RUN apt-get -y update
RUN apt-get -y install postgresql-client

# Create the database -- gets info from already existing environment variables
RUN createdb $PGDATABASE -U $PGUSER -h $PGHOST -W $PGPASS
#
## Clone the repo and checkout the master branch. Put the checkout in
## the same location nodejs-webapp cookbook puts it. Set the working directory
## to the checkout.
#RUN git clone https://github.com/osuosl/timesync-node $TIMESYNC_CHECKOUT
#WORKDIR $TIMESYNC_CHECKOUT
#
## Install dependencies.
#RUN npm install
#
## Run migrations. The database server must exist and we must have credentials.
#RUN npm run migrations
#
##CMD ["npm", "start"]
