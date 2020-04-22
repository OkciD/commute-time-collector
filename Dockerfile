FROM node:12-alpine

ENV WAYPOINTS       ""
ENV CRON_EXPRESSION ""

ENV TOR_HOST        "tor"
ENV TOR_PORTS       9050
ENV SELENIUM_HOST   "selenium"
ENV SELENIUM_PORT   4444
ENV LOGS_DIR        "/var/log/commute-time-collector"
ENV OUT_DIR         "/root/commute-time-collector"

VOLUME $LOGS_DIR
VOLUME $OUT_DIR

USER root

RUN apk add logrotate

WORKDIR /etc/logrotate.d
COPY ./logrotate.conf ./commute-time-collector

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "start", "--",\
	"--waypoints=${WAYPOINTS}",\
	"--cronExpression=${CRON_EXPRESSION}",\
	"--torHost=${TOR_HOST}",\
	"--torPorts=${TOR_PORTS}", \
	"--seleniumHost=${SELENIUM_HOST}",\
    "--seleniumPorts=${SELENIUM_PORTS}", \
	"--logsDir=${LOGS_DIR}", \
	"--outDir=${OUT_DIR}"]
