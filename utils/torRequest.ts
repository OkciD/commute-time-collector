// @ts-ignore
import tr from 'tor-request';
import request from 'request';
import params from './params';
import util from 'util';
import { createLocalLogger, CustomizedLogger } from './logger';

const localLogger: CustomizedLogger = createLocalLogger(module);

/**
 * Генератор, возвращающий бесконечный циклический итератор по переданному итерируемому объекту
 */
function* endlessGenerator<T = any>(iterableObject: Iterable<T>) {
	while (true) {
		yield* iterableObject;
	}
}

const torPortsIterator = endlessGenerator(params.torPorts);

// начинаем со случайного порта, "прокручивая" итератор от 0 до torPorts.length
const initialPortIndex = Math.floor(Math.random() * (params.torPorts.length + 1));
for (let i = 0; i < initialPortIndex; i++) {
	torPortsIterator.next();
}

/**
 * Функция, осуществляющая запросы через SOCKS-проксю тора
 */
export default async function torRequest(requestOptions: request.OptionsWithUrl): Promise<request.Response> {
	localLogger.debug('Called torRequest', { options: requestOptions });

	const torPort: number = +torPortsIterator.next().value;
	localLogger.debug(`Using tor port ${torPort}`);

	tr.setTorAddress(params.torHost, torPort);

	// tor-request.request можно скастить к request, потому что он является обёрткой над request
	const promisifiedTorRequest = util.promisify(tr.request as typeof request);

	const response: request.Response = await promisifiedTorRequest({
		...requestOptions,
		time: true,
	});
	const { statusCode, timingPhases, body } = response;

	localLogger.performance('API timings', timingPhases);

	if (statusCode !== 200 || body.error) {
		// todo: cut body
		throw response.toJSON();
	}

	return response;
}
