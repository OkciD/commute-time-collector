import scrapePageData, { PageData } from './lib/scrapePageData';
import prepareCookieJar from './lib/prepareCookieJar';
import requestPromise from 'request-promise-native';

(async (): Promise<void> => {
	const { csrfToken, sessionId, cookies }: PageData = await scrapePageData();

	// todo: типизировать
	const response = await requestPromise({
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
	});

	console.log(response);
})().catch((error) => {
	console.error(error);
});
