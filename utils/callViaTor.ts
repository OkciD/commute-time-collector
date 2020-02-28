// @ts-ignore
import torRequest from 'tor-request';
import request from 'request';
import params from './params';
import util from 'util';
import { createLocalLogger, CustomizedLogger } from './logger';

const localLogger: CustomizedLogger = createLocalLogger(module);

function* endlessGenerator<T = any>(iterableObject: Iterable<T>) {
	while (true) {
		yield* iterableObject;
	}
}

const torPortsIterator = endlessGenerator(params.torPorts);

const initialPortIndex = Math.floor(Math.random() * (params.torPorts.length + 1));
for (let i = 0; i < initialPortIndex; i++) {
	torPortsIterator.next();
}

export default async function callViaTor(requestOptions: request.OptionsWithUrl): Promise<request.Response> {
	localLogger.debug('Called callViaTor', { options: requestOptions });

	const torPort: number = +torPortsIterator.next().value;
	localLogger.debug(`Using tor port ${torPort}`);

	torRequest.setTorAddress(params.torHost, torPort);

	const promisifiedTorRequest = util.promisify(torRequest.request as typeof request);

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
