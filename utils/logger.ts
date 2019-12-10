import winston from 'winston';

const logger: winston.Logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.label({
			label: Math.random().toString(36).substr(2, 7),
		}),
		winston.format.ms(),
		winston.format.timestamp({
			format: 'DD.MM.YYYY HH:mm:ss',
		}),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	transports: [
		new winston.transports.File({ filename: 'commute-time-collector.log' }),
	],
});

export default logger;
