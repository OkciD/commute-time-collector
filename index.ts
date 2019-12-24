import scrapeCredentials, { Credentials } from './lib/scrapeCredentials';
import logger, { cleanupWdioLogs } from './utils/logger';
import params from './utils/params';
import chalk from 'chalk';
import { measuredAsyncFn, measuredSyncFn } from './utils/performance';
import { FilteredAutoRoute } from './types';
import getRoutes from './lib/getRoutes';
import recordRoutesData from './lib/recordRoutesData';

process.addListener('unhandledRejection', (reason?: {} | null | Error) => {
	logger.error('Unhandled rejection', { reason: (reason as Error)?.stack });
	console.error(chalk.red('Unhandled rejection, reason: ', (reason as Error)?.stack));
	logger.end();

	process.exit(1);
});

process.on('exit', () => {
	cleanupWdioLogs();
});

async function main(): Promise<void> {
	const { startCoords, endCoords } = params;

	// todo: validate coords
	if (!startCoords || !endCoords) {
		console.error(chalk.red(
			'Either start or end coordinates are not found. ' +
			'Please make sure you have provided both --startCoords and --endCoords params',
		));

		process.exit(1);
	}

	logger.info('Start');

	const credentials: Credentials = await measuredAsyncFn(scrapeCredentials)();
	logger.info('Successfully scraped credentials from the page');

	const routes: FilteredAutoRoute[] | null = await getRoutes(startCoords, endCoords, credentials);

	if (!routes) {
		logger.error('Failed to fetch routes');
		return;
	}
	logger.info('Successfully fetched routes data');

	measuredSyncFn(recordRoutesData)(params.outDir, routes);
	logger.info('Routes data has been written to a file');

	logger.info('End');
}

measuredAsyncFn(main)();
