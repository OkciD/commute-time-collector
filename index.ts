import scrapePageData, { PageData } from './lib/scrapePageData';
import prepareCookieJar from './lib/prepareCookieJar';
import requestPromise from 'request-promise-native';
import logger from './utils/logger';
import { PerformanceObserver, PerformanceEntry, PerformanceObserverEntryList, performance } from 'perf_hooks';
import { AutoRoute, BuildRouteResponse } from './types';

const performanceObserver: PerformanceObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
	const entries: PerformanceEntry[] = list.getEntries();

	entries.forEach(({ name, duration, entryType }: PerformanceEntry) => {
		logger.performance(name, { duration, entryType });
	});
});

performanceObserver.observe({ entryTypes: ['measure', 'function'], buffered: true });

process.addListener('unhandledRejection', (reason?: {} | null) => {
	logger.error(reason ?? 'Unknown error');

	process.exit(1);
});

(async (): Promise<void> => {
	performance.mark('start');
	logger.info('Start');

	performance.mark('scrapePageData:start');
	const pageData: PageData = await scrapePageData();
	performance.mark('scrapePageData:end');
	performance.measure('scrapePageData', 'scrapePageData:start', 'scrapePageData:end');

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
			rll: '37.15833163671875,55.794240795394906~37.2764346640625,55.8746182642246', // todo: параметризовать
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

	if (statusCode !== 200) {
		logger.error('Request', {
			statusCode,
			headers,
			body: `${body.slice(0, 300)}...`,
		});

		return;
	}

	const { data } = body as BuildRouteResponse;
	logger.debug('Response OK',
		data.routes.map(({ distance, duration, durationInTraffic, flags }: AutoRoute) => ({
			distance,
			duration,
			durationInTraffic,
			flags,
		})));

	logger.info('End');
	performance.mark('end');
	performance.measure('total', 'start', 'end');
})();
