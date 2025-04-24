FROM node:latest AS builder
LABEL authors="jitsedesmet"

WORKDIR /var/www/sgv
COPY package.json yarn.lock ./

RUN yarn install

ARG BASE_URL_REPLACE="http:\/\/localhost:3000"
COPY . .
RUN cat src/lib/baseUrl.ts | sed "s/http:\/\/localhost:3000/${BASE_URL_REPLACE}/g" > src/lib/baseUrl.ts
RUN yarn run build



FROM nginx:latest AS runner

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /var/www/sgv/build/ /usr/share/nginx/html

