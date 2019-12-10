import winston from 'winston';
import fecha from 'fecha';

const logger: winston.Logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.label({
			label: Math.random().toString(36).substr(2, 7), // рандомный хеш
		}),
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

export default logger;
