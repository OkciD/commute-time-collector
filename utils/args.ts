import minimist from 'minimist';
import WebDriver from 'webdriver';

interface Args extends minimist.ParsedArgs {
	logsDir: string;
	wdioLogLevel: WebDriver.WebDriverLogTypes,
	chromedriverSilent: boolean,
}

const args: Args = minimist<Args>(process.argv.slice(2), {
	default: {
		wdioLogLevel: 'debug',
		chromedriverSilent: false,
	},
});

export default args;
