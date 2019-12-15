import minimist from 'minimist';
import WebDriver from 'webdriver';
import packageJson from '../package.json';

interface Args extends minimist.ParsedArgs {
	logsDir: string;
	wdioLogLevel: WebDriver.WebDriverLogTypes,
	chromedriverSilent: boolean,
}

const args: Args = minimist<Args>(process.argv.slice(2), {
	default: {
		logsDir: packageJson.logsDir,
		wdioLogLevel: 'error',
		chromedriverSilent: false,
	},
});

export default args;
