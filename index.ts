import requestPromise from 'request-promise-native';
import { CookieJar } from 'request';

const cookieJar: CookieJar = requestPromise.jar();

const CSRF_TOKEN_REGEXP: RegExp = /'csrfToken':'([a-z0-9]+:[a-z0-9]+)'/i;
const SESSION_ID_REGEXP: RegExp = /'sessionId':'([a-z0-9]+_[a-z0-9]+)'/i;

(async () => {
	const yandexMapsHtml: string = await requestPromise({
		uri: 'https://yandex.ru/maps',
		jar: cookieJar,
		headers: {
			'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language':'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
			'cache-control':'no-cache',
			'pragma':'no-cache',
			'sec-fetch-mode':'navigate',
			'sec-fetch-site':'none',
			'sec-fetch-user':'?1',
			'upgrade-insecure-requests':'1',
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:70.0) Gecko/20100101 Firefox/70.0'
		}
	});

	console.log(yandexMapsHtml);

	const csrfTokenMatchArray: RegExpMatchArray | null = yandexMapsHtml.match(CSRF_TOKEN_REGEXP);
	const sessionIdMatchArray: RegExpMatchArray | null = yandexMapsHtml.match(SESSION_ID_REGEXP);

	if (!csrfTokenMatchArray) {
		throw new Error('Cannot parse CSRF token');
	}

	if (!sessionIdMatchArray) {
		throw new Error('Cannot parse sessionId');
	}

	const csrfToken: string = csrfTokenMatchArray[1];
	const sessionId: string = sessionIdMatchArray[1];

	console.log(csrfToken);
	console.log(sessionId);
})();
