import scrapeCredentials, { Credentials } from './lib/scrapeCredentials';
import logger from './utils/logger';
import { measuredAsyncFn, measuredSyncFn } from './utils/performance';
import { FilteredAutoRoute } from './types';
import getRoutes from './lib/getRoutes';
import recordRoutesData from './lib/recordRoutesData';
import cron from 'node-cron';
import context from './utils/context';

async function main(): Promise<void> {
	try {
		logger.info('Start', { params: context.params });
		const { waypoints, outDir } = context.params;

		const credentials: Credentials = await measuredAsyncFn(scrapeCredentials)();
		logger.info('Successfully scraped credentials from the page');

		const routes: FilteredAutoRoute[] = await getRoutes(waypoints, credentials);
		logger.info('Successfully fetched routes data');

		measuredSyncFn(recordRoutesData)(outDir, routes);
		logger.info('Routes data has been written to a file');

		logger.info('End');
	} catch (error) {
		logger.error(error ?? 'Unknown error');

		throw error;
	}
}

if (context.isDev) {
	measuredAsyncFn(main)()
		.catch(() => {
			logger.end(() => {
				process.exit(1);
			});
		});
} else {
	cron.schedule(context.params.cronExpression, () => {
		measuredAsyncFn(main)()
			.catch((error) => {
				console.error(error);
			})
			.finally(() => {
				context.reload();
			});
	});
}
