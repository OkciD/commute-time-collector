import * as Webdriver from 'webdriver';
import * as WebdriverIO from 'webdriverio';
import * as chromedriver from 'chromedriver';

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

const CHROMEDRIVER_PORT: number = 9515;

/**
 * Заходим на страницу Яндекс карт webdriver'ом и webscrape'им из неё нужные для запроса в апишку данные
 * Заходим webdriver'ом потому, что Яндекс банит запросы за html'ем карт не из браузера
 * @return {Promise<PageData>}
 */
export default async function scrapePageData(): Promise<PageData> {
	// запускаем chromedriver
	chromedriver.start([`--port=${CHROMEDRIVER_PORT}`, '--url-base=wd/hub']);

	// запускаем и настраиваем wdio
	const browser: WebdriverIO.BrowserObject = await WebdriverIO.remote({
		port: CHROMEDRIVER_PORT,
		capabilities: {
			browserName: 'chrome',
			'goog:chromeOptions': {
				args: ['--headless', '--disable-gpu'], // используем headless chrome
			},
		},
	});

	// заходим на страницу Яндекс карт
	await browser.url('https://yandex.ru/maps');

	// ищем на странице тег <script>, в котором зашит json с кучей полезных данных
	const pageConfigJson: string | null = await browser.execute<string | null>(() => {
		const scriptElement: HTMLScriptElement | null = document.querySelector('script.config-view');

		return scriptElement ? scriptElement.innerHTML : null;
	});

	if (!pageConfigJson) {
		throw new Error('Unable to find config on the page');
	}

	// достаём все куки
	const cookies: WebDriver.Cookie[] = await browser.getCookies();

	// закрываем браузер, стопаем chromedriver
	await browser.deleteSession();
	chromedriver.stop();

	let pageConfig: PageConfig = JSON.parse(pageConfigJson);

	return {
		csrfToken: pageConfig.csrfToken,
		sessionId: pageConfig.counters.analytics.sessionId,
		cookies
	}
}