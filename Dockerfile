FROM node:16-bullseye as angular-build

RUN apt-get update && apt-get install -yq bzip2 build-essential libxtst6 git \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app

# install dependencies
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json

RUN npm config set unsafe-perm true
RUN npm ci

ENV NODE_ENV production

# copy src
COPY . /app/

# post-install hook, to be safe if it got cached
RUN node config/patch_crypto.js

ARG RUN_ENV

# compile to check for errors
RUN npm run build -- --configuration=${RUN_ENV}

###################################

FROM nginx:1-alpine

COPY --from=angular-build /app/dist/dapp-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
