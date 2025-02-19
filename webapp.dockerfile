FROM node:latest AS builder
LABEL authors="jitsedesmet"

WORKDIR /var/www/sgv
COPY package.json yarn.lock ./

RUN yarn install
COPY . .
RUN yarn run build



FROM nginx:latest AS runner

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /var/www/sgv/build/ /usr/share/nginx/html

