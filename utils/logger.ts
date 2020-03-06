import winston from 'winston';
import path from 'path';
import context from './context';

const LOGS_DIR: string = context.params.logsDir;
const CURRENT_DATE_STR: string = context.date;
const SESSION_ID: string = context.id;

export type CustomizedLogger = winston.Logger & {
	performance: winston.LeveledLogMethod
};

/**
 * Кастомные уровни логирования. Потому что дефолтные меня не устроили
 * @see https://github.com/winstonjs/winston#logging-levels
 */
const customLoggingLevels: winston.LoggerOptions['levels'] = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
	performance: 4,
};

/**
 * Объект с цветами для каждого уровня логирования
 */
winston.addColors({
	error: 'red',
	warn: 'yellow',
	info: 'green',
	debug: 'gray',
	performance: 'blue',
});

/**
 * Логгер для продакшна. Пишет json-лог в файлик
 */
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

/**
 * Логгер для дева. Пишет раскрашенный лог в консоль
 */
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

/**
 * Создаёт логгер для модуля, который пишет в лог его имя. Это должно помочь в отладке. Я надеюсь
 */
export function createLocalLogger(module: NodeJS.Module): CustomizedLogger {
	return logger.child({
		module: path.parse(module.filename).name,
	}) as CustomizedLogger;
}

export default logger;
