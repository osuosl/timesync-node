FROM node:0.12


ENV TIMESYNC_CHECKOUT /opt/timesync-node
ENV NODE_ENV production
ENV PORT 8000
ENV PG_CONNECTION_STRING postgres://timesync:pass@postgres:5432/timesync-prod


ADD . $TIMESYNC_CHECKOUT
WORKDIR $TIMESYNC_CHECKOUT

# Install dependencies.
RUN npm install

CMD ["npm", "start"]
