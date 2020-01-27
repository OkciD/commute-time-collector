FROM node:12

WORKDIR /usr/src/app

# устанавливаем в контейнер хром
RUN apt-get -y update
RUN apt-get -y install chromium

COPY package.json .
COPY package-lock.json .
RUN npm ci --only=prod
COPY . .

ENTRYPOINT [ "npm", "start" ]
