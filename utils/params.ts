import minimist from 'minimist';
import path from 'path';

interface Params extends minimist.ParsedArgs {
	logsDir: string;
	startCoords: string;
	endCoords: string;
	outDir: string;
	torIp: string;
	torPorts: string;
}

const parsedParams: Params = minimist<Params>(process.argv.slice(2), {
	default: {
		logsDir: path.resolve('logs'),
		torIp: '127.0.0.1',
		torPorts: '9050',
	},
});

export default {
	...parsedParams,
	torPorts: parsedParams.torPorts.split(','),
};
