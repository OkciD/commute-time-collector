import minimist from 'minimist';
import WebDriver from 'webdriver';
import path from 'path';

interface Params extends minimist.ParsedArgs {
	logsDir: string;
	wdioLogLevel: WebDriver.WebDriverLogTypes;
	startCoords: string;
	endCoords: string;
	outDir: string;
}

const params: Params = minimist<Params>(process.argv.slice(2), {
	default: {
		logsDir: path.resolve('logs'),
		wdioLogLevel: 'error',
	},
});

export default params;
