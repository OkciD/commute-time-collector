import winston from 'winston';
import fecha from 'fecha';
import args from './args';
import packageJson from '../package.json';
import WebDriver from 'webdriver';

const LOGS_DIR: string = args.logsDir ?? packageJson.logsDir;

const currentDateString: string = fecha.format(new Date(), 'DD-MM-YYYY');
const id: string = Math.random().toString(36).substr(2, 7); // рандомный хеш

export type Logger = winston.Logger;

export function getChromedriverLogArg(): string | null {
	if (process.env.NODE_ENV !== 'dev' || args.chromedriverSilent) {
		return '--silent';
	}

	return null;
}

export function getWdioLogConfig(): { logLevel: WebDriver.WebDriverLogTypes, outputDir?: string } {
	return {
		logLevel: args.wdioLogLevel,
		...(process.env.NODE_ENV !== 'dev') && { outputDir: LOGS_DIR },
	};
}

const prodLogger: Logger = winston.createLogger({
	defaultMeta: {
		sid: id,
	},
	format: winston.format.combine(
		winston.format.ms(),
		winston.format.timestamp({
			format: 'HH:mm:ss',
		}),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	transports: [
		new winston.transports.File({
			dirname: LOGS_DIR,
			filename: `${currentDateString}.log`,
		}),
	],
});

const devLogger: Logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.ms(),
		winston.format.timestamp({
			format: 'HH:mm:ss',
		}),
		winston.format.colorize({
			all: true,
		}),
		winston.format.errors({ stack: true }),
		winston.format.simple(),
	),
	transports: [
		new winston.transports.Console(),
	],
});

export default process.env.NODE_ENV === 'dev' ? devLogger : prodLogger;
