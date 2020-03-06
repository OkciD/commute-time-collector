FROM node:12-alpine

ENV START_COORDS ""
ENV END_COORDS ""
ENV CRON_EXPRESSION ""
ENV TOR_HOST ""
ENV TOR_PORTS 9050

USER root
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "start:prod", "--", "--startCoords=${START_COORDS}", "--endCoords=${END_COORDS}", "--cronExpression=${CRON_EXPRESSION}", "--torHost=${TOR_HOST}", "--torPorts=${TOR_PORTS}" ]
