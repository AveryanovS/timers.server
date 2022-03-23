## build
FROM node:lts-alpine AS build

LABEL maintainer="Semen A <averyanoff98@gmail.com>"

WORKDIR /opt

COPY package.json /opt
COPY package-lock.json /opt
COPY tsconfig.json /opt
RUN npm install

COPY src/ /opt/src
RUN npm run build

# production
FROM node:lts-alpine

LABEL maintainer="Semen A <averyanoff98@gmail.com>"

WORKDIR /opt

COPY package.json /opt
COPY package-lock.json /opt
RUN npm install --production

COPY --from=build /opt/dist /opt
#COPY ./dist /opt
CMD ["node", "src/index.js"]
