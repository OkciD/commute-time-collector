import * as WebdriverIO from 'webdriverio';
import chromediver from 'chromedriver';

interface ConfigView {
	csrfToken: string;
	counters: {
		analytics: {
			sessionId: string;
		};
	};
}

(async () => {
	chromediver.start(['--port=9515', '--url-base=wd/hub']);

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
		throw new Error('Unable to find config-view script on page');
	}

	const cookies: WebDriver.Cookie[] = await browser.getCookies();

	await browser.deleteSession();
	chromediver.stop();

	let mapsConfig: ConfigView = JSON.parse(configViewJson);

	console.log(mapsConfig.csrfToken);
	console.log(mapsConfig.counters.analytics.sessionId);
	console.log(cookies);
})();
