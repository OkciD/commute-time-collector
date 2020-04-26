FROM node:12-alpine

ENV WAYPOINTS       ""
ENV CRON_EXPRESSION ""

ENV TOR_HOST        "tor"
ENV SELENIUM_HOST   "selenium"
ENV LOGS_DIR        "/var/log/commute-time-collector"
ENV OUT_DIR         "/root/commute-time-collector"

VOLUME $LOGS_DIR
VOLUME $OUT_DIR

USER root

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "start", "--", \
	"--waypoints=${WAYPOINTS}", \
	"--cronExpression=${CRON_EXPRESSION}", \
	"--torHost=${TOR_HOST}", \
	"--torPorts=${TOR_PORTS}", \
	"--seleniumHost=${SELENIUM_HOST}", \
    "--seleniumPort=${SELENIUM_PORTS}", \
	"--logsDir=${LOGS_DIR}", \
	"--outDir=${OUT_DIR}"]
