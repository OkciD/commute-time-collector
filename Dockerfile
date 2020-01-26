FROM node:12

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=prod
COPY . .

RUN sed -i 's/sudo //' ./install-chrome.sh

RUN bash install-chrome.sh

#CMD [ "npm", "start" ]
