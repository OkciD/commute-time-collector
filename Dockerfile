FROM node:12-alpine

ENV WAYPOINTS       ""
ENV CRON_EXPRESSION ""

ENV TOR_HOST        "tor"
ENV TOR_PORTS       "9050,9052,9053,9054"
ENV SELENIUM_HOST   "selenium"
ENV SELENIUM_PORT   "4444"
#ENV LOGS_FILE       "/var/log/commute-time-collector/commute-time-collector.log"
ENV OUT_DIR         "/root/commute-time-collector"

ENV TZ              "Europe/Moscow"

VOLUME $OUT_DIR

USER root

# выставляем в контейнере таймзону из переменной окружения TZ
RUN apk --update add tzdata && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY .npmrc ./
COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD [ "npm", "run", "--silent", "start", "--", \
	"--docker", \
	"--waypoints=${WAYPOINTS}", \
	"--cronExpression=${CRON_EXPRESSION}", \
	"--torHost=${TOR_HOST}", \
	"--torPorts=${TOR_PORTS}", \
	"--seleniumHost=${SELENIUM_HOST}", \
    "--seleniumPort=${SELENIUM_PORT}", \
#	"--logFile=${LOGS_FILE}", \
	"--outDir=${OUT_DIR}"]
