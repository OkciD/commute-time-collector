import * as Webdriver from 'webdriver';
import request from 'request';
// @ts-ignore
import torRequest from 'tor-request';
import cheerio from 'cheerio';
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

	torRequest.setTorAddress('127.0.0.1', 9050);
	torRequest.request('https://yandex.ru/maps/', {
		jar: cokieJar,
	}, (err: unknown, res: request.Response, body: string) => {
		if (err || res.statusCode !== 200) {
			console.error(err);
			return;
		}

		console.log(body);
		const $ = cheerio.load(body);
		const configView = $('script.config-view').get()[0];
		const json = configView.children[0].data;

		console.log(JSON.stringify(JSON.parse(json), null, 2));
	});
}
