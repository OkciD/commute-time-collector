import params from './params';
import assert from 'assert';
import cron from 'node-cron';
import tcpPortUsed from 'tcp-port-used';

export default async function validateParams(kek: typeof params) {
	const { startCoords, endCoords, cronExpression, torPorts, torHost } = kek;

	// todo: проверять формат startCoords и endCoords
	[startCoords, endCoords].forEach((coords) => {
		assert.notEqual(typeof coords, 'undefined', 'Params startCoords & endCoords are required');
	});

	// проверяем валидность cron-выражения встроенным в пакет node-cron валидатором
	assert.ok(
		cron.validate(cronExpression),
		'Invalid cronExpression param. See: https://github.com/node-cron/node-cron',
	);

	await Promise.all(torPorts.map((torPort: string) =>
		tcpPortUsed
			.check(+torPort, torHost)
			.then((isUsed: boolean) => assert.ok(isUsed, `${torHost}:${torPort} is not occupied by any process`)),
	));
}
