import scrapePageData, { PageData } from './lib/scrapePageData';
import prepareCookieJar from './lib/prepareCookieJar';
import requestPromise from 'request-promise-native';
import logger, { cleanupWdioLogs } from './utils/logger';
import { AutoRoute, BuildRouteResponse, FilteredAutoRoute } from './types';
import params from './utils/params';
import chalk from 'chalk';
import measuredAsyncFn from './utils/performance';

process.addListener('unhandledRejection', (reason?: {} | null) => {
	logger.error(reason ?? 'Unknown error');
	console.error(chalk.red('Unhandled rejection, reason: ', reason ?? 'Unknown error'));

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

	const pageData: PageData = await measuredAsyncFn(scrapePageData)();

	logger.info('Successfully scraped data from the page');

	const { csrfToken, sessionId, cookies } = pageData;
	const { body, timingPhases, statusCode, headers }: requestPromise.FullResponse = await requestPromise({
		uri: 'https://yandex.ru/maps/api/router/buildRoute',
		method: 'GET',
		qs: {
			ajax: 1,
			csrfToken,
			ignoreTravelModes: 'avia',
			lang: 'ru',
			locale: 'ru_RU',
			mode: 'best',
			regionId: '213', // id Москвы (вроде бы необязательный параметр)
			results: '6',
			rll: `${startCoords}~${endCoords}`,
			sessionId,
			type: 'auto',
		},

		jar: prepareCookieJar(cookies),
		json: true,

		resolveWithFullResponse: true,
		time: true,
		simple: false,
	});
	logger.performance('Request', timingPhases);

	if (statusCode !== 200 || body.error) {
		logger.error('Request', {
			statusCode,
			headers,
			body: JSON.stringify(body).slice(0, 300),
		});

		return;
	}

	const { data } = body as BuildRouteResponse;
	const filteredRouteData: FilteredAutoRoute[] = data.routes.map((route: AutoRoute) => ({
		uuid: route.uuid,
		distance: route.distance.value,
		duration: route.duration.value,
		durationInTraffic: route.durationInTraffic.value,
		flags: route.flags,
	}));

	logger.debug('Response OK', { filteredRouteData });

	logger.info('End');
}

measuredAsyncFn(main)();
