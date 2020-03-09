FROM node:12-alpine
MAINTAINER Jasper Kuperus

# Install package.json
WORKDIR /app
COPY /package.json /yarn.lock /app/
RUN yarn install && yarn cache clean

# Bundle the application, compile it
COPY . /app
RUN yarn type

CMD ["yarn", "start"]
