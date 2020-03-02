import minimist from 'minimist';
import path from 'path';

interface Params extends minimist.ParsedArgs {
	startCoords: string;
	endCoords: string;

	logsDir: string;
	outDir: string;

	torHost: string;
	torPorts: string;

	cronExpression: string;
}

const parsedParams: Params = minimist<Params>(process.argv.slice(2), {
	default: {
		logsDir: path.resolve('logs'),

		torHost: '127.0.0.1',
		torPorts: '9050',
	},
});

export default {
	...parsedParams,
	torPorts: parsedParams.torPorts.split(','),
};
