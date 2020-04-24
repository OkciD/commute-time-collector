import fecha from 'fecha';
import minimist from 'minimist';
import path from 'path';
import assert from 'assert';
import cron from 'node-cron';

const FLOAT = '\\d+(\\.\\d+)';
const WAYPOINTS_PAIR = `${FLOAT},${FLOAT}`;
const WAYPOINTS_REGEXP = new RegExp(`^${WAYPOINTS_PAIR}(->${WAYPOINTS_PAIR})+$`);

/**
 * Генератор, возвращающий бесконечный циклический итератор по переданному итерируемому объекту
 * [1, 2, 3] => 1, 2, 3, 1, 2, 3, ...
 */
function* endlessGenerator<T = any>(iterableObject: Iterable<T>) {
	while (true) {
		yield* iterableObject;
	}
}

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
	public id: string = '';
	public date: string = '';
	public dateTime: string = '';
	public isDev: boolean = process.env.NODE_ENV === 'dev';

	public params: Params = {
		waypoints: [],
		cronExpression: '',
	};

	public logsDir: string = path.resolve('logs');
	public outDir: string = path.resolve('out');

	public torHost: string = '127.0.0.1';
	private torPortsIterator: Generator<number>;
	public currentTorPort: number = 9050;

	public seleniumHost: string = '127.0.0.1';
	public seleniumPort: number = 4444;

	constructor(argv: typeof process.argv) {
		const parsedArgv = minimist<ParsedArgv>(argv.slice(2));

		Context.validateParams(parsedArgv);

		const { waypoints, cronExpression, torPorts } = parsedArgv;
		this.params = {
			waypoints: waypoints
				.split('->')
				.map((coordsPair: string) => coordsPair.split(',') as [string, string]),
			cronExpression,
		};

		(['logsDir', 'outDir', 'torHost', 'seleniumHost', 'seleniumPort'] as const).forEach((key) => {
			if (parsedArgv[key]) {
				// @ts-ignore
				this[key] = parsedArgv[key];
			}
		});

		const torPortsArray = torPorts?.split(',').map((port: string) => +port) || [9050, 9052, 9053, 9054];
		this.torPortsIterator = endlessGenerator(torPortsArray);

		// начинаем со случайного порта, "прокручивая" итератор на величину от 0 до torPortsArray.length
		const initialPortIndex = Math.floor(Math.random() * (torPortsArray.length + 1));
		for (let i = 0; i < initialPortIndex; i++) {
			this.torPortsIterator.next();
		}

		this.reload();
	}

	public reload() {
		const date = new Date();

		this.date = fecha.format(date, 'YYYY-MM-DD');
		this.dateTime = fecha.format(date, 'YYYY-MM-DDTHH:mm:ssZZ'); // iso format
		this.id = Math.random().toString(36).substr(2, 7); // рандомная число-буквенная строка
		this.currentTorPort = this.torPortsIterator.next().value;
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
