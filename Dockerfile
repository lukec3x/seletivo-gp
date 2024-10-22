FROM node:20.18.0-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

COPY entrypoint.sh ./
RUN chmod +x /app/entrypoint.sh

RUN yarn build

ENTRYPOINT ["/app/entrypoint.sh"]
