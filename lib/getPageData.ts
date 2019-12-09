import * as Webdriver from 'webdriver';
import * as WebdriverIO from 'webdriverio';
import * as chromedriver from 'chromedriver';

export interface PageData {
	csrfToken: string;
	sessionId: string;
	cookies: Webdriver.Cookie[];
}

interface ConfigView {
	csrfToken: string;
	counters: {
		analytics: {
			sessionId: string;
		};
	};
}

export default async function getPageData(): Promise<PageData> {
	chromedriver.start(['--port=9515', '--url-base=wd/hub']);

	const browser: WebdriverIO.BrowserObject = await WebdriverIO.remote({
		port: 9515,
		capabilities: {
			browserName: 'chrome',
			'goog:chromeOptions': {
				args: ['--headless', '--disable-gpu'],
			},
		},
		maxInstances: 1,
	});

	await browser.url('https://yandex.ru/maps');

	const configViewJson: string | null = await browser.execute<string | null>(() => {
		const scriptElement = document.querySelector('script.config-view');

		return scriptElement ? scriptElement.innerHTML : null;
	});

	if (!configViewJson) {
		throw new Error('Unable to find config-view script on the page');
	}

	const cookies: WebDriver.Cookie[] = await browser.getCookies();

	await browser.deleteSession();
	chromedriver.stop();

	let mapsConfig: ConfigView = JSON.parse(configViewJson);

	return {
		csrfToken: mapsConfig.csrfToken,
		sessionId: mapsConfig.counters.analytics.sessionId,
		cookies
	}
}
