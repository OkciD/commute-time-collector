FROM node:12-alpine

# устанавливаем в контейнер хром
RUN apk add chromium

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=prod
COPY . .

ENTRYPOINT [ "npm", "run", "start:prod" ]
