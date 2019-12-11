import winston from 'winston';
import fecha from 'fecha';

export type Logger = winston.Logger;

const prodLogger: Logger = winston.createLogger({
	defaultMeta: {
		sid: Math.random().toString(36).substr(2, 7), // рандомный хеш
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
			dirname: 'logs',
			filename: `${fecha.format(new Date(), 'DD-MM-YYYY')}.log`,
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
