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
			browserName: 'chrome'
		},
		maxInstances: 1,
		logLevel: 'error',
	});

	await browser.url('https://yandex.ru/maps');

	const configViewJson: string | null = await browser.execute<string | null>(() => {
		const scriptElement = document.querySelector('script.config-view');

		return scriptElement ? scriptElement.innerHTML : null;
	});

	if (!configViewJson) {
		throw new Error('Unable to find config-view script on page');
	}

	await browser.deleteSession();
	chromediver.stop();

	let mapsConfig: ConfigView = JSON.parse(configViewJson);

	console.log(mapsConfig.csrfToken);
	console.log(mapsConfig.counters.analytics.sessionId);
})();
