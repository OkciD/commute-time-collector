import * as Webdriver from 'webdriver';
import * as WebdriverIO from 'webdriverio';
import * as chromedriver from 'chromedriver';
import { logsDir } from '../utils/logger';

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
let browser: WebdriverIO.BrowserObject;

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
			process.env.NODE_ENV !== 'dev' && '--silent',
			// @ts-ignore
		], true);

		// запускаем и настраиваем wdio
		browser = await WebdriverIO.remote({
			port: CHROMEDRIVER_PORT,
			capabilities: {
				browserName: 'chrome',
				'goog:chromeOptions': {
					args: ['--headless', '--disable-gpu'], // используем headless chrome
				},
			},
			...process.env.NODE_ENV !== 'dev' && { outputDir: logsDir },
		});

		// заходим на страницу Яндекс карт
		await browser.url('https://yandex.ru/maps');

		// ищем на странице тег <script>, в котором зашит json с кучей полезных данных
		const pageConfigJson: string | undefined = await browser.execute<string | undefined>(() => {
			const scriptElement: HTMLScriptElement | null = document.querySelector('script.config-view');

			return scriptElement?.innerHTML;
		});

		if (!pageConfigJson) {
			throw new Error('Unable to find config on the page');
		}

		// достаём все куки
		const cookies: WebDriver.Cookie[] = await browser.getCookies();

		const pageConfig: PageConfig = JSON.parse(pageConfigJson);

		return {
			csrfToken: pageConfig.csrfToken,
			sessionId: pageConfig.counters.analytics.sessionId,
			cookies,
		};
	} finally {
		// закрываем браузер, стопаем chromedriver
		await browser.deleteSession();
		chromedriver.stop();
	}
}
