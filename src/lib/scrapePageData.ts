import { createLocalLogger, CustomizedLogger } from '../utils/logger';
import * as WebdriverIO from 'webdriverio';
import { PageData } from '../types';

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

const YANDEX_MAPS_URL = 'https://yandex.ru/maps';

/**
 * Заходим на страницу Яндекс карт webdriver'ом и webscrape'им из неё нужные для запроса в апишку данные
 * Заходим webdriver'ом потому, что Яндекс банит запросы за html'ем карт не из браузера
 */
export default async function scrapePageData(): Promise<PageData> {
	// вытаскиваем объект browser наверх, чтобы получить к нему доступ из секции finally
	let browser: WebdriverIO.BrowserObject | null = null;

	try {
		// запускаем и настраиваем wdio
		browser = await WebdriverIO.remote({
			hostname: '127.0.0.1',
			port: 4444,
			path: '/wd/hub',
			capabilities: {
				browserName: 'chrome',
				'goog:chromeOptions': {
					args: [
						'--headless',
						'--disable-gpu',
						'--proxy-server=socks5://tor:9050',
					],
				},
			},
			logLevel: 'silent',
		});
		localLogger.debug('Initialized WDIO');

		// заходим на страницу Яндекс карт
		localLogger.debug('Navigating to Yandex maps page', { url: YANDEX_MAPS_URL });
		await browser.url(YANDEX_MAPS_URL);

		const actualUrl: string = await browser.getUrl();

		if (actualUrl.startsWith(YANDEX_MAPS_URL)) {
			localLogger.debug('Navigation successful', { url: actualUrl });
		} else {
			// todo: error with actual url
			throw new Error(`Redirect happened ${actualUrl}`);
		}

		// ищем на странице тег <script>, в котором зашит json с кучей полезных данных
		const configViewJson: string | undefined = await browser.execute(() => {
			const scriptElement: HTMLScriptElement | null = document.querySelector('script.config-view');

			return scriptElement?.innerText;
		});

		if (typeof configViewJson === 'undefined' || configViewJson === null) {
			throw new Error('Unable to find config on the page');
		}
		localLogger.debug('Config script has been found', { valueSlice: `${configViewJson.slice(0, 50)}...` });

		const configView: ConfigView = JSON.parse(configViewJson);
		localLogger.debug('Page config parsed successfully');

		// достаём все куки
		const cookies: WebDriver.Cookie[] = await browser.getCookies();
		localLogger.debug('Cookies', { value: cookies });

		// Получаем юзер-агента
		const userAgent = await browser.execute(() => navigator.userAgent);
		localLogger.debug('Got User-Agent', { userAgent });

		const result: PageData = {
			csrfToken: configView.csrfToken,
			sessionId: configView.counters.analytics.sessionId,
			cookies,
			userAgent,
		};
		localLogger.debug('Returned value', { value: result });

		return result;
	} finally {
		localLogger.debug('Got into the "finally" section');

		if (browser) {
			await browser.deleteSession();
			localLogger.debug('Deleted browser session');
		} else {
			localLogger.debug('Browser object doesnt exist', { typeofBrowserObject: typeof browser });
		}
	}
}
