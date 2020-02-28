import request from 'request';
// @ts-ignore
import cheerio from 'cheerio';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';
import torRequest from '../utils/torRequest';

export interface Credentials {
	csrfToken: string;
	sessionId: string;
	cookieJar: request.CookieJar
}

// укороченный тайпинг для зашитого в html'е json'а с полезными данными
interface ConfigView {
	csrfToken: string;
	counters: {
		analytics: {
			sessionId: string;
		};
	};
}

const localLogger: CustomizedLogger = createLocalLogger(module);

/**
 * Заходим на страницу Яндекс карт webdriver'ом и webscrape'им из неё нужные для запроса в апишку креды
 * Заходим webdriver'ом потому, что Яндекс банит запросы за html'ем карт не из браузера
 * @return {Promise<Credentials>}
 */
export default async function scrapeCredentials(): Promise<Credentials> {
	const cookieJar: request.CookieJar = request.jar();

	const response: request.Response = await torRequest({
		url: 'https://yandex.ru/maps/',
		jar: cookieJar,
	});

	const $ = cheerio.load(response.body);
	const configView = $('script.config-view').get()[0];

	if (!configView) {
		throw new Error('todo: error 1');
	}

	const json = configView.children[0].data;

	if (!json) {
		throw new Error('todo: error 2');
	}

	const parsedConfigView: ConfigView = JSON.parse(json);

	const result: Credentials = {
		csrfToken: parsedConfigView.csrfToken,
		sessionId: parsedConfigView.counters.analytics.sessionId,
		cookieJar,
	};

	console.log(result);

	return result;
}
