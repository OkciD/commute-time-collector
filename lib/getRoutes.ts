import { Credentials } from './scrapeCredentials';
import requestPromise from 'request-promise-native';
import prepareCookieJar from './prepareCookieJar';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';
import { AutoRoute, BuildRouteResponse, FilteredAutoRoute } from '../types';

const localLogger: CustomizedLogger = createLocalLogger(module);

export default async function getRoutes(
	startCoords: string,
	endCoords: string,
	credentials: Credentials,
): Promise<FilteredAutoRoute[] | null> {
	const { csrfToken, sessionId, cookies } = credentials;

	const options: requestPromise.OptionsWithUri = {
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
	};

	localLogger.debug('Request options', { options });

	const response: requestPromise.FullResponse = await requestPromise(options);
	const { statusCode, timingPhases, body } = response;

	localLogger.performance('API', timingPhases);

	if (statusCode !== 200 || body.error) {
		localLogger.error('Request failed', { response: response.toJSON() });

		return null;
	}

	localLogger.debug('API response OK', {
		response: {
			...response,
			body: '<omitted>',
		}.toJSON(),
	});

	const { data } = body as BuildRouteResponse;
	const filteredRoutes: FilteredAutoRoute[] = data.routes.map((route: AutoRoute) => ({
		uuid: route.uuid,
		distance: route.distance.value,
		duration: route.duration.value,
		durationInTraffic: route.durationInTraffic.value,
		flags: {
			blocked: route.flags.blocked,
			hasTolls: route.flags.hasTolls,
			futureBlocked: route.flags.futureBlocked,
			deadJam: route.flags.deadJam,
		},
	}));

	localLogger.debug('Returned value', { value: filteredRoutes });

	return filteredRoutes;
}
