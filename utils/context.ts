import fecha from 'fecha';
import minimist from 'minimist';
import { Merge } from 'type-fest';
import path from 'path';
import assert from 'assert';
import cron from 'node-cron';

interface RawParams {
	waypoints: string;

	logsDir: string;
	outDir: string;

	torHost: string;
	torPorts: string;

	cronExpression: string;
}

type Params = Merge<RawParams, {
	waypoints: [string, string][],
	torPorts: string[]
}>;

class Context {
	public date: string = '';
	public time: string = '';
	public id: string = '';
	public isDev: boolean = process.env.NODE_ENV === 'dev';
	public params: Params = {
		waypoints: [],

		logsDir: path.resolve('logs'),
		outDir: path.resolve('out'),

		torHost: '127.0.0.1',
		torPorts: ['9050'],

		cronExpression: '',
	};

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
			waypoints: rawParams.waypoints.split('->')
				.map((coordsPair: string) => coordsPair.split(',').slice(0, 2) as [string, string]),
		};

		Context.validateParams(params);
		this.params = params;
	}

	private static validateParams(params: Params): void {
		const { waypoints, cronExpression } = params;

		// todo: проверять формат waypoints
		assert.notEqual(typeof waypoints, 'undefined', 'Params startCoords & endCoords are required');

		// проверяем валидность cron-выражения встроенным в пакет node-cron валидатором
		assert.ok(
			cron.validate(cronExpression),
			'Invalid cronExpression param. See: https://github.com/node-cron/node-cron',
		);
	}
}

const context = new Context();
context.importParams(process.argv.slice(2));

export default context;
