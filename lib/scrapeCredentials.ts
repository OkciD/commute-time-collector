import * as Webdriver from 'webdriver';
import request from 'request';
// @ts-ignore
import torRequest from 'tor-request';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';

export interface Credentials {
	csrfToken: string;
	sessionId: string;
	cookies: Webdriver.Cookie[];
}

// укороченный тайпинг для зашитого в html'е json'а с полезными данными
interface PageConfig {
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
// @ts-ignore
export default async function scrapeCredentials(): Credentials {
	const cokieJar: request.CookieJar = request.jar();

	torRequest.request('https://yandex.ru/maps/', {
		jar: cokieJar,
	}, (err: unknown, res: request.Response /* , body: unknown */) => {
		if (!err && res.statusCode === 200) {
			console.log(cokieJar.getCookieString('https://yandex.ru/maps'));
		}
	});
}
