import * as WebDriver from 'webdriver';
import request from 'request';
import { Cookie } from 'tough-cookie';

export default function prepareCookieJar(cookies: WebDriver.Cookie[]): request.CookieJar {
	const jar: request.CookieJar = request.jar();

	cookies.forEach((cookie: WebDriver.Cookie) => {
		jar.setCookie(new Cookie({
			key: cookie.name,
			value: cookie.value,
			httpOnly: cookie.httpOnly,
			path: cookie.path,
			secure: cookie.secure,
			domain: cookie.domain,
		}).toString(), 'https://yandex.ru/maps');
	});

	return jar;
}
