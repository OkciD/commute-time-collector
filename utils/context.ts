import fecha from 'fecha';
import minimist from 'minimist';
import { Merge } from 'type-fest';
import path from 'path';
import assert from 'assert';
import cron from 'node-cron';
// import tcpPortUsed from 'tcp-port-used';
import fs from 'fs';

interface RawParams extends minimist.ParsedArgs {
	startCoords: string;
	endCoords: string;

	logsDir: string;
	outDir: string;

	torHost: string;
	torPorts: string;

	cronExpression: string;
}

type Params = Merge<RawParams, { torPorts: string[] }>;

class Context {
	public date: string = '';
	public time: string = '';
	public id: string = '';
	public isDev: boolean = process.env.NODE_ENV === 'dev';
	public params: Params = {
		logsDir: path.resolve('logs'),
		outDir: path.resolve('out'),

		torHost: '127.0.0.1',
		torPorts: ['9050'],
	};

	private static readonly CheckPortRetryInterval = 500;
	private static readonly CheckPortTimeout = 3000;

	constructor() {
		this.reload();
	}

	public reload() {
		const date = new Date();

		this.date = fecha.format(date, 'YYYY-MM-DD');
		this.time = fecha.format(date, 'HH:mm:ss');
		this.id = Math.random().toString(36).substr(2, 7); // рандомная число-буквенная строка
	}

	public importParams(argv: typeof process.argv): void {
		const rawParams = minimist<RawParams>(argv);

		const params = {
			...this.params,
			...rawParams,
			torPorts: rawParams.torPorts.split(','),
		};

		Context.validateParams(params);
		this.params = params;
	}

	private static validateParams(params: Params): void {
		const { startCoords, endCoords, cronExpression, /* torPorts, torHost, */ logsDir, outDir } = params;

		// todo: проверять формат startCoords и endCoords
		[startCoords, endCoords].forEach((coords) => {
			assert.notEqual(typeof coords, 'undefined', 'Params startCoords & endCoords are required');
		});
		// console.log('startCoords & endCoords ok');

		// проверяем валидность cron-выражения встроенным в пакет node-cron валидатором
		assert.ok(
			cron.validate(cronExpression),
			'Invalid cronExpression param. See: https://github.com/node-cron/node-cron',
		);
		// console.log('cronExpression ok');

		// проверяем доступность хоста и портов tor - все порты должны быть заняты
		// await Promise.all(torPorts.map((torPort: string) => tcpPortUsed
		// 	.check({
		// 		port: +torPort,
		// 		host: torHost,
		// 		status: true,
		// 		retryTimeMs: Context.CheckPortRetryInterval,
		// 		timeOutMs: Context.CheckPortTimeout,
		// 	})
		// 	.then((isUsed: boolean) => {
		// 		assert.ok(isUsed, `${torHost}:${torPort} is not occupied by any process`);
		// 		// console.log(`${torHost}:${torPort} is accessible`);
		// 	}),
		// ));

		// проверяем доступ на запись в outDir
		fs.accessSync(outDir, fs.constants.W_OK);
		// console.log('outDir is permitted to write');

		// проверяем доступ на запись в logsDir
		fs.accessSync(logsDir, fs.constants.W_OK);
		// console.log('logsDir is permitted to write');
	}
}

const context = new Context();
context.importParams(process.argv.slice(2));

export default context;
