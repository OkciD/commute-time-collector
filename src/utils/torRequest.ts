// @ts-ignore
import tr from 'tor-request';
import request from 'request';
import util from 'util';
import { createLocalLogger, CustomizedLogger } from './logger';
import context from './context';

const localLogger: CustomizedLogger = createLocalLogger(module);


/**
 * Функция, осуществляющая запросы через SOCKS-проксю тора
 */
export default async function torRequest(requestOptions: request.OptionsWithUrl): Promise<request.Response> {
	localLogger.debug('Called torRequest', { options: requestOptions });

	const { torHost, currentTorPort } = context;

	localLogger.debug(`Using tor port ${currentTorPort}`);

	tr.setTorAddress(torHost, currentTorPort);

	// tor-request.request можно скастить к request, потому что он является обёрткой над request
	const promisifiedTorRequest = util.promisify(tr.request as typeof request);

	const response: request.Response = await promisifiedTorRequest({
		...requestOptions,
		time: true,
	});
	const { statusCode, timingPhases, body } = response;

	localLogger.performance('API timings', timingPhases);

	if (statusCode !== 200 || body.error) {
		// todo: cut the body
		throw response.toJSON();
	}

	return response;
}
