// @ts-ignore
import tr from 'tor-request';
import request from 'request';
import util from 'util';
import { createLocalLogger, CustomizedLogger } from './logger';
import context from './context';
import CustomError, { ErrorCode } from './error';

const localLogger: CustomizedLogger = createLocalLogger(module);


/**
 * Функция, осуществляющая запросы через SOCKS-проксю тора
 */
export default async function torRequest(requestOptions: request.OptionsWithUrl): Promise<request.Response> {
	try {
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
			throw new CustomError(ErrorCode.torRequestStatusCodeError, 'API error', response.toJSON());
		}

		localLogger.debug(`Successfully got response from ${requestOptions.url}`, response.toJSON());

		return response;
	} catch (error) {
		if (!(error instanceof CustomError)) {
			error.code = ErrorCode.torRequestError;
		}
		throw error;
	}
}
