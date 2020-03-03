import scrapeCredentials, { Credentials } from './lib/scrapeCredentials';
import logger from './utils/logger';
import params from './utils/params';
import { measuredAsyncFn, measuredSyncFn } from './utils/performance';
import { FilteredAutoRoute } from './types';
import getRoutes from './lib/getRoutes';
import recordRoutesData from './lib/recordRoutesData';
// import cron from 'node-cron';
import context from './utils/context';
import validateParams from './utils/validateParams';

async function main(): Promise<void> {
	logger.info('Start', { params });

	await validateParams(params);

	context.init();

	const credentials: Credentials = await measuredAsyncFn(scrapeCredentials)();
	logger.info('Successfully scraped credentials from the page');

	const routes: FilteredAutoRoute[] = await getRoutes(params.startCoords, params.endCoords, credentials);
	logger.info('Successfully fetched routes data');

	measuredSyncFn(recordRoutesData)(params.outDir, routes);
	logger.info('Routes data has been written to a file');

	logger.info('End');
}

// cron.schedule('* * * * *', () => {
measuredAsyncFn(main)()
	.catch((error?: {} | null | Error) => {
		logger.error(error ?? 'Unknown error');

		logger.end();
		process.exit(1);
	});
// });
