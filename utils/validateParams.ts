import params from './params';
import assert from 'assert';
import cron from 'node-cron';
import tcpPortUsed from 'tcp-port-used';
import { createLocalLogger, CustomizedLogger } from './logger';
import fs from 'fs';

const CHECK_PORT_RETRY_INTERVAL = 500;
const CHECK_PORT_TIMEOUT = 3000;

const localLogger: CustomizedLogger = createLocalLogger(module);

export default async function validateParams(kek: typeof params) {
	const { startCoords, endCoords, cronExpression, torPorts, torHost, logsDir, outDir } = kek;

	// todo: проверять формат startCoords и endCoords
	[startCoords, endCoords].forEach((coords) => {
		assert.notEqual(typeof coords, 'undefined', 'Params startCoords & endCoords are required');
	});
	localLogger.debug('startCoords & endCoords ok');

	// проверяем валидность cron-выражения встроенным в пакет node-cron валидатором
	assert.ok(
		cron.validate(cronExpression),
		'Invalid cronExpression param. See: https://github.com/node-cron/node-cron',
	);
	localLogger.debug('cronExpression ok');

	await Promise.all(torPorts.map((torPort: string) => {
		localLogger.debug(`Checking access to ${torHost}:${torPort}`);

		return tcpPortUsed
			.check({
				port: +torPort,
				host: torHost,
				status: true,
				retryTimeMs: CHECK_PORT_RETRY_INTERVAL,
				timeOutMs: CHECK_PORT_TIMEOUT,
			})
			.then((isUsed: boolean) => {
				assert.ok(isUsed, `${torHost}:${torPort} is not occupied by any process`);
				localLogger.debug(`${torHost}:${torPort} is accessible`);
			});
	}));

	fs.accessSync(outDir, fs.constants.W_OK);
	localLogger.debug('outDir is permitted to write');

	fs.accessSync(logsDir, fs.constants.W_OK);
	localLogger.debug('logsDir is permitted to write');
}
