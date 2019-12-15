import winston from 'winston';
import fecha from 'fecha';
import args from './args';
import WebDriver from 'webdriver';
import path from 'path';
import fs from 'fs';

const LOGS_DIR: string = args.logsDir;
const CURRENT_DATE_STR: string = fecha.format(new Date(), 'DD-MM-YYYY');
const SESSION_ID: string = Math.random().toString(36).substr(2, 7); // рандомный хеш

export type Logger = winston.Logger;

export function getChromedriverLogArg(): string | null {
	if (process.env.NODE_ENV !== 'dev' || args.chromedriverSilent) {
		return '--silent';
	}

	return null;
}

export function getWdioLogConfig(): { logLevel: WebDriver.WebDriverLogTypes, outputDir?: string } {
	const dirPath: string = path.join(LOGS_DIR, 'wdio-errors', CURRENT_DATE_STR, SESSION_ID);

	// wdio не умеет создавать себе папку для логов, если её нет, так что позаботимся о нём
	if (process.env.NODE_ENV !== 'dev') {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	return {
		logLevel: args.wdioLogLevel,
		...(process.env.NODE_ENV !== 'dev') && {
			outputDir: dirPath,
		},
	};
}

const prodLogger: Logger = winston.createLogger({
	defaultMeta: {
		sid: SESSION_ID,
	},
	format: winston.format.combine(
		winston.format.timestamp({ format: 'HH:mm:ss' }),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	transports: [
		new winston.transports.File({
			dirname: LOGS_DIR,
			filename: `${CURRENT_DATE_STR}.log`,
		}),
	],
});

const devLogger: Logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: 'HH:mm:ss' }),
		winston.format.colorize({ all: true }),
		winston.format.errors({ stack: true }),
		winston.format.simple(),
	),
	transports: [
		new winston.transports.Console(),
	],
});

export default process.env.NODE_ENV === 'dev' ? devLogger : prodLogger;
