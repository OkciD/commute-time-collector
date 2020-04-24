import winston from 'winston';
import path from 'path';
import context from './context';

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
		sid: context.id,
		time: context.dateTime,
	},
	levels: customLoggingLevels,
	level: 'performance',
	format: winston.format.combine(
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	transports: [
		new winston.transports.File({
			dirname: context.logsDir,
			filename: 'commute-time-collector.log',
		}),
	],
}) as CustomizedLogger;

/**
 * Логгер для дева. Пишет раскрашенный лог в консоль
 */
const devLogger: CustomizedLogger = winston.createLogger({
	defaultMeta: {
		sid: context.id,
		time: context.dateTime,
	},
	levels: customLoggingLevels,
	level: 'performance',
	format: winston.format.combine(
		winston.format.colorize({ all: true }),
		winston.format.errors({ stack: true }),
		winston.format.simple(),
	),
	transports: [
		new winston.transports.Console(),
	],
}) as CustomizedLogger;

const logger: CustomizedLogger = (context.isDev) ? devLogger : prodLogger;

/**
 * Создаёт логгер для модуля, который пишет в лог его имя. Это должно помочь в отладке. Я надеюсь
 */
export function createLocalLogger(module: NodeJS.Module): CustomizedLogger {
	return logger.child({
		module: path.parse(module.filename).name,
	}) as CustomizedLogger;
}

export default logger;
