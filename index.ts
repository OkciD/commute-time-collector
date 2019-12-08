import * as WebdriverIO from 'webdriverio';
import chromediver from 'chromedriver';

(async () => {
	chromediver.start(['--port=9515', '--url-base=wd/hub']);

	const browser: WebdriverIO.BrowserObject = await WebdriverIO.remote({
		port: 9515,
		capabilities: {
			browserName: 'chrome'
		},
		maxInstances: 1,
	});

	await browser.url('https://yandex.ru/maps');
	await browser.debug();

	await browser.deleteSession();

	chromediver.stop();
})();
