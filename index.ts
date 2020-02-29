import scrapeCredentials, { Credentials } from './lib/scrapeCredentials';
import logger from './utils/logger';
import params from './utils/params';
import { measuredAsyncFn, measuredSyncFn } from './utils/performance';
import { FilteredAutoRoute } from './types';
import getRoutes from './lib/getRoutes';
import recordRoutesData from './lib/recordRoutesData';

async function main(): Promise<void> {
	const { startCoords, endCoords } = params;

	// todo: validate coords
	if (!startCoords || !endCoords) {
		throw new Error(
			'Either start or end coordinates are not found. ' +
			'Please make sure you have provided both --startCoords and --endCoords params',
		);
	}

	logger.info('Start', { params });

	const credentials: Credentials = await measuredAsyncFn(scrapeCredentials)();
	logger.info('Successfully scraped credentials from the page');

	const routes: FilteredAutoRoute[] = await getRoutes(startCoords, endCoords, credentials);
	logger.info('Successfully fetched routes data');

	measuredSyncFn(recordRoutesData)(params.outDir, routes);
	logger.info('Routes data has been written to a file');

	logger.info('End');
}

measuredAsyncFn(main)()
	.catch((error?: {} | null | Error) => {
		logger.error({ error });

		logger.end();
		process.exit(1);
	});
