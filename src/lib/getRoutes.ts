import { PageData } from './scrapePageData';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';
import { AutoRoute, BuildRouteResponse, FilteredAutoRoute } from '../types';
import torRequest from '../utils/torRequest';
import request from 'request';

const localLogger: CustomizedLogger = createLocalLogger(module);

export default async function getRoutes(
	waypoints: [string, string][],
	credentials: PageData,
): Promise<FilteredAutoRoute[]> {
	const { csrfToken, sessionId, cookieJar } = credentials;

	const options: request.OptionsWithUrl = {
		url: 'https://yandex.ru/maps/api/router/buildRoute',
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
			rll: waypoints.map(([latitude, longitude]) => `${longitude},${latitude}`).join('~'),
			sessionId,
			type: 'auto',
		},

		jar: cookieJar,
		json: true,
	};

	const { body }: request.Response = await torRequest(options);

	const { data } = body as BuildRouteResponse;
	const filteredRoutes: FilteredAutoRoute[] = data.routes.map((route: AutoRoute) => ({
		uuid: route.uuid,
		distance: route.distance.value,
		duration: route.duration,
		durationInTraffic: route.durationInTraffic,
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
