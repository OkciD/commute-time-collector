import minimist from 'minimist';
import WebDriver from 'webdriver';
import packageJson from '../package.json';

interface Params extends minimist.ParsedArgs {
	logsDir: string;
	wdioLogLevel: WebDriver.WebDriverLogTypes,
	chromedriverSilent: boolean,
	startCoords: string;
	endCoords: string;
}

const params: Params = minimist<Params>(process.argv.slice(2), {
	default: {
		logsDir: packageJson.logsDir,
		wdioLogLevel: 'error',
		chromedriverSilent: false,
	},
});

export default params;
