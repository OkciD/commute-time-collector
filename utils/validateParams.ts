import params from './params';
import assert from 'assert';
import cron from 'node-cron';
import tcpPortUsed from 'tcp-port-used';

export default async function validateParams(kek: typeof params) {
	const { startCoords, endCoords, cronExpression, torPorts, torHost } = kek;

	// проверяем, что startCoords и endCoords - числа (точнее строки с числами)
	assert.notDeepStrictEqual(
		[+startCoords, +endCoords],
		[NaN, NaN],
		'Params startCoords & endCoords are supposed to be numbers',
	);

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
