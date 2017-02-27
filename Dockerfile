FROM node:argon

RUN mkdir -p /opt/code
WORKDIR /opt/code
COPY . /opt/code

RUN npm install
RUN npm run migrations
RUN npm run create-account -- -u admin -p admin

EXPOSE 8000

CMD [ "npm", "run", "devel" ]
