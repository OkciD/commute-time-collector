import scrapeCredentials, { Credentials } from './lib/scrapeCredentials';
import logger, { cleanupWdioLogs } from './utils/logger';
import params from './utils/params';
import chalk from 'chalk';
import { measuredAsyncFn } from './utils/performance';
import { FilteredAutoRoute } from './types';
import getRoutes from './lib/getRoutes';
import recordRoutesData from './lib/recordRoutesData';

process.addListener('unhandledRejection', (reason?: {} | null | Error) => {
	logger.error('Unhandled rejection', { reason: (reason as Error)?.stack });
	console.error(chalk.red('Unhandled rejection, reason: ', (reason as Error)?.stack));

	process.exit(1);
});

process.on('exit', () => {
	cleanupWdioLogs();
});

async function main(): Promise<void> {
	logger.info('Start');

	const { startCoords, endCoords } = params;

	// todo: validate coords
	if (!startCoords || !endCoords) {
		console.error(chalk.red(
			'Either start or end coordinates are not found. ' +
			'Please make sure you have provided both --startCoords and --endCoords params',
		));

		process.exit(1);
	}

	const credentials: Credentials = await measuredAsyncFn(scrapeCredentials)();
	logger.info('Successfully scraped credentials from the page');

	const routes: FilteredAutoRoute[] | null = await getRoutes(startCoords, endCoords, credentials);

	if (!routes) {
		logger.error('Failed to fetch routes');
		return;
	}
	logger.info('Successfully fetched routes data');

	recordRoutesData(params.outDir, routes);

	logger.info('End');
}

measuredAsyncFn(main)();
