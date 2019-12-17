import * as Webdriver from 'webdriver';
import * as WebdriverIO from 'webdriverio';
import * as chromedriver from 'chromedriver';
import { createLocalLogger, CustomizedLogger, getChromedriverLogArg, getWdioLogConfig } from '../utils/logger';

export interface PageData {
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

const CHROMEDRIVER_PORT = 9515;

// вытаскиваем объект browser наверх, чтобы получить к нему доступ из секции finally
let browser: WebdriverIO.BrowserObject;
const localLogger: CustomizedLogger = createLocalLogger(module);

/**
 * Заходим на страницу Яндекс карт webdriver'ом и webscrape'им из неё нужные для запроса в апишку данные
 * Заходим webdriver'ом потому, что Яндекс банит запросы за html'ем карт не из браузера
 * @return {Promise<PageData>}
 */
export default async function scrapePageData(): Promise<PageData> {
	try {
		// запускаем chromedriver
		// todo: no ts-ignore
		await chromedriver.start([
			`--port=${CHROMEDRIVER_PORT}`,
			'--url-base=wd/hub',
			getChromedriverLogArg(),
			// @ts-ignore
		], true);
		localLogger.debug('Started chromedriver');

		// запускаем и настраиваем wdio
		browser = await WebdriverIO.remote({
			port: CHROMEDRIVER_PORT,
			capabilities: {
				browserName: 'chrome',
				'goog:chromeOptions': {
					args: ['--headless', '--disable-gpu'], // используем headless chrome
				},
			},
			...getWdioLogConfig(),
		});
		localLogger.debug('Initialized WDIO');

		// заходим на страницу Яндекс карт
		await browser.url('https://yandex.ru/maps');
		localLogger.debug('Navigated to url', {
			expected: 'https://yandex.ru/maps',
			actual: await browser.getUrl(),
		});

		// ищем на странице тег <script>, в котором зашит json с кучей полезных данных
		const pageConfigJson: string | undefined = await browser.execute<string | undefined>(() => {
			const scriptElement: HTMLScriptElement | null = document.querySelector('script.config-view');

			return scriptElement?.innerHTML;
		});

		if (typeof pageConfigJson === 'undefined') {
			throw new Error('Unable to find config on the page');
		}

		localLogger.debug('Config script has been found', { value: pageConfigJson.slice(0, 100) });

		const pageConfig: PageConfig = JSON.parse(pageConfigJson);
		localLogger.debug('Page config parsed successfully');

		// достаём все куки
		const cookies: WebDriver.Cookie[] = await browser.getCookies();
		localLogger.debug('Cookies', { value: cookies });

		const result: PageData = {
			csrfToken: pageConfig.csrfToken,
			sessionId: pageConfig.counters.analytics.sessionId,
			cookies,
		};
		localLogger.debug('Returning page data', { value: result });

		return result;
	} finally {
		localLogger.debug('Got into the "finally" section');

		await browser.deleteSession();
		localLogger.debug('Deleted browser session');

		chromedriver.stop();
		localLogger.debug('Stopped chromedriver');
	}
}
