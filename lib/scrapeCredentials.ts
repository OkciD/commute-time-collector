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
 * Ходим за html'ем Яндекс карт, выпаршиваем из него json с нужными токенами и созраняем куки
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
		throw new Error('Config-view script was not found');
	}

	const json = configView.children[0].data;

	if (!json) {
		localLogger.debug('No data in config-view script', { configView });
		throw new Error('Can not find config-view json');
	}

	const parsedConfigView: ConfigView = JSON.parse(json);

	const result: Credentials = {
		csrfToken: parsedConfigView.csrfToken,
		sessionId: parsedConfigView.counters.analytics.sessionId,
		cookieJar,
	};

	localLogger.debug('Returned value', { value: result });

	return result;
}
