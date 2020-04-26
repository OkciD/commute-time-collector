FROM node:12-alpine

ENV WAYPOINTS       ""
ENV CRON_EXPRESSION ""

ENV TOR_HOST        "tor"
ENV SELENIUM_HOST   "selenium"
ENV LOGS_FILE       "/var/log/commute-time-collector/commute-time-collector.log"
ENV OUT_DIR         "/root/commute-time-collector"

VOLUME $OUT_DIR

USER root

# выводим файл с логами в stdout, чтобы докер их съел
RUN ln -sf /dev/stdout ${LOGS_FILE};

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
	"--logFile=${LOGS_FILE}", \
	"--outDir=${OUT_DIR}"]
