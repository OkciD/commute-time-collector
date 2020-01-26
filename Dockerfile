FROM node:12

WORKDIR /usr/src/app

# устанавливаем в контейнер хром
RUN curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" | tee -a /etc/apt/sources.list.d/google-chrome.list > /dev/null
RUN apt-get -y update
RUN apt-get -y install google-chrome-stable

COPY package.json .
COPY package-lock.json .
RUN npm ci --only=prod
COPY . .

ENTRYPOINT [ "npm", "start" ]
