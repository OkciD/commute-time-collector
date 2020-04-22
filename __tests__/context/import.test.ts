const originalArgv = process.argv;

describe('Context import tests', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	afterEach(() => {
		process.argv = originalArgv;
	});

	test('Should not throw exception when params are ok', async () => {
		process.argv = [
			'',
			'',
			'--waypoints=55.751347,37.618731->55.754930,37.573071',
			'--cronExpression=* * * * *',
			'--torHost=127.0.0.1',
			'--torPorts=9050,9052,9053,9054',
			'--logsDir=./logs',
			'--outDir=./out',
		];

		const { default: context } = await import('../../src/utils/context');
		expect(context.importParams).not.toThrow();

		expect(context.params).toBe({
			waypoints: [['55.751347', '37.618731'], ['55.754930', '37.573071']],
			cronExpression: '* * * * *',
			torHost: '127.0.0.1',
			torPorts: ['9050', '9052', '9053', '9054'],
		});
	});
});
