FROM node:12-alpine

ENV WAYPOINTS       ""
ENV CRON_EXPRESSION ""
ENV TOR_HOST        ""
ENV TOR_PORTS       9050

USER root
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "start:prod", "--",\
	"--waypoints=${WAYPOINTS}",\
	"--cronExpression=${CRON_EXPRESSION}",\
	"--torHost=${TOR_HOST}",\
	"--torPorts=${TOR_PORTS}"]
