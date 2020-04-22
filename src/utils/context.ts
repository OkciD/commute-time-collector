import fecha from 'fecha';
import minimist from 'minimist';
import { Merge } from 'type-fest';
import path from 'path';
import assert from 'assert';
import cron from 'node-cron';
import UserAgent from 'user-agents';

const FLOAT = '\\d+(\\.\\d+)?';
const WAYPOINTS_PAIR = `${FLOAT},${FLOAT}`;
const WAYPOINTS_REGEXP = new RegExp(`^${WAYPOINTS_PAIR}(->${WAYPOINTS_PAIR})+$`);

const TOR_PORTS_REGEXP = /^\d+(,\d+)+$/;

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

	public userAgent: string = new UserAgent({
		vendor: 'Google Inc.',
		deviceCategory: 'desktop',
	}).toString();

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

		Context.validateParams(rawParams);

		this.params = {
			...this.params,
			...rawParams,
			...(rawParams.outDir) && { outDir: path.resolve(rawParams.outDir) },
			...(rawParams.logsDir) && { logsDir: path.resolve(rawParams.logsDir) },
			torPorts: rawParams.torPorts.split(','),
			waypoints: rawParams.waypoints.split('->')
				.map((coordsPair: string) => coordsPair.split(',') as [string, string]),
		};
	}

	private static validateParams(params: RawParams): void {
		const { waypoints, cronExpression, torPorts } = params;

		// проверяем наличие параметра waypoints
		assert.notEqual(typeof waypoints, 'undefined', 'Param "waypoints" is required');
		// проверяем формат параметра waypoints
		assert.ok(
			WAYPOINTS_REGEXP.test(waypoints),
			'Invalid "waypoints" param. It should be <float>,<float>-><float>,<float>[-><float>,<float>] ' +
			'(e.g. 55.751347,37.618731->55.754930,37.573071)',
		);

		// проверяем валидность cron-выражения встроенным в пакет node-cron валидатором
		assert.ok(
			cron.validate(cronExpression),
			'Invalid "cronExpression" param. See: https://github.com/node-cron/node-cron#cron-syntax',
		);

		// проверяем строку с портами для Tor
		assert.ok(
			TOR_PORTS_REGEXP.test(torPorts),
			'Invalid "torPorts" param. It should be <int>[,int] (e.g. 9050 or 9050,9052,9053)',
		);

		// todo: validate logsDir & outDir
	}
}

const context = new Context();
context.importParams(process.argv.slice(2));

export default context;
