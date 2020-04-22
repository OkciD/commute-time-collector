import torRequest from './torRequest';

export default async function getPublicIp(): Promise<string> {
	const { body: publicIp } = await torRequest({
		url: 'https://api.ipify.org',
	});

	return publicIp;
}
