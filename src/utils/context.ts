import fecha from 'fecha';
import minimist from 'minimist';
import path from 'path';
import assert from 'assert';
import cron from 'node-cron';

const FLOAT = '\\d+(\\.\\d+),';
const WAYPOINTS_PAIR = `${FLOAT},${FLOAT}`;
const WAYPOINTS_REGEXP = new RegExp(`^${WAYPOINTS_PAIR}(->${WAYPOINTS_PAIR})+$`);

interface ParsedArgv {
	waypoints: string;
	cronExpression: string;

	logsDir?: string;
	outDir?: string;

	torHost?: string;
	torPorts?: string;

	seleniumHost?: string;
	seleniumPort?: string;
}

type Params = {
	waypoints: [string, string][];
	cronExpression: string;
};

class Context {
	public date: string = '';
	public dateTime: string = '';
	public id: string = '';
	public isDev: boolean = process.env.NODE_ENV === 'dev';

	public params: Params = {
		waypoints: [],
		cronExpression: '',
	};

	public logsDir: string = path.resolve('logs');
	public outDir: string = path.resolve('out');

	public torHost: string = '127.0.0.1';
	public torPorts: number[] = [9050, 9052, 9053, 9054];
	public currentTorPort: number = this.torPorts[0]; // todo: random

	public seleniumHost: string = '127.0.0.1';
	public seleniumPort: number = 4444;

	constructor(argv: typeof process.argv) {
		this.importFromArgv(argv);
		this.reload();
	}

	public reload() {
		const date = new Date();

		this.date = fecha.format(date, 'isoDate');
		this.dateTime = fecha.format(date, 'isoDateTime');
		this.id = Math.random().toString(36).substr(2, 7); // рандомная число-буквенная строка
	}

	private importFromArgv(argv: typeof process.argv): void {
		const parsedArgv = minimist<ParsedArgv>(argv.slice(2));

		Context.validateParams(parsedArgv);

		const { waypoints, cronExpression } = parsedArgv;

		this.params = {
			waypoints: waypoints
				.split('->')
				.map((coordsPair: string) => coordsPair.split(',') as [string, string]),
			cronExpression,
		};

		(['logsDir', 'outDir', 'torHost', 'torPorts', 'seleniumHost', 'seleniumPort'] as const).forEach((key) => {
			if (parsedArgv[key]) {
				// @ts-ignore
				this[key] = parsedArgv[key];
			}
		});
	}

	private static validateParams(params: ParsedArgv): void {
		const { waypoints, cronExpression } = params;

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
	}
}

const context = new Context(process.argv);

export default context;
