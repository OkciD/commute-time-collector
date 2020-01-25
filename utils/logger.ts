import winston from 'winston';
import params from './params';
import WebDriver from 'webdriver';
import path from 'path';
import fs from 'fs';
import sessionData from './sessionData';

const LOGS_DIR: string = params.logsDir;
const CURRENT_DATE_STR: string = sessionData.date;
const SESSION_ID: string = sessionData.id;

export type CustomizedLogger = winston.Logger & {
	performance: winston.LeveledLogMethod
};

export function getWdioLogConfig(): { logLevel: WebDriver.WebDriverLogTypes, outputDir?: string } {
	const dirPath: string = path.join(LOGS_DIR, 'wdio', SESSION_ID);
	const isSilent: boolean = params.wdioLogLevel === 'silent';

	// wdio не умеет создавать себе папку для логов, если её нет, так что позаботимся о нём
	if (!isSilent) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	return {
		logLevel: params.wdioLogLevel,
		...(!isSilent) && {
			outputDir: dirPath,
		},
	};
}

const customLoggingLevels: winston.LoggerOptions['levels'] = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
	performance: 4,
};

winston.addColors({
	error: 'red',
	warn: 'yellow',
	info: 'green',
	debug: 'gray',
	performance: 'blue',
});

const prodLogger: CustomizedLogger = winston.createLogger({
	defaultMeta: {
		sid: SESSION_ID,
	},
	levels: customLoggingLevels,
	level: 'performance',
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
}) as CustomizedLogger;

const devLogger: CustomizedLogger = winston.createLogger({
	levels: customLoggingLevels,
	level: 'performance',
	format: winston.format.combine(
		winston.format.timestamp({ format: 'HH:mm:ss' }),
		winston.format.colorize({ all: true }),
		winston.format.errors({ stack: true }),
		winston.format.simple(),
	),
	transports: [
		new winston.transports.Console(),
	],
}) as CustomizedLogger;

const logger: CustomizedLogger = (process.env.NODE_ENV === 'dev') ? devLogger : prodLogger;

export function createLocalLogger(module: NodeJS.Module): CustomizedLogger {
	return logger.child({
		module: path.parse(module.filename).name,
	}) as CustomizedLogger;
}

export default logger;
