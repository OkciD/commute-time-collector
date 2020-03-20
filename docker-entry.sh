#!/usr/bin/env sh

crond # запускаем cron, чтобы заработал установленный в контейнере logrotate

npm run start:prod -- \
	--waypoints="$WAYPOINTS" \
	--cronExpression="$CRON_EXPRESSION" \
	--torHost="$TOR_HOST" \
	--torPorts="$TOR_PORTS" \
	--logsDir="$LOGS_DIR" \
	--outDir="$OUT_DIR"
