// @ts-ignore
import torRequest from 'tor-request';
import request from 'request';
import params from './params';
import util from 'util';

function* endlessGenerator<T = any>(iterableObject: Iterable<T>) {
	while (true) {
		yield* iterableObject;
	}
}

const torPortsIterator = endlessGenerator(params.torPorts);

export default function callViaTor(requestOptions: request.OptionsWithUrl): Promise<request.Response> {
	const torPort: number = +torPortsIterator.next().value;

	torRequest.setTorAddress(params.torIp, torPort);

	const promisifiedTorRequest = util.promisify(torRequest.request as typeof request);

	return promisifiedTorRequest(requestOptions)
		.then((res: request.Response) => {
			if (res.statusCode !== 200) {
				// todo: omit body if html
				throw res;
			}

			return res;
		});
}
