FROM ubuntu:latest

WORKDIR /home/root

# Install Node.js
RUN apt-get install -y curl
RUN curl --silent --location https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

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
