import csvStringify from 'csv-stringify/lib/sync';
import { FilteredAutoRoute } from '../types';
import flat from 'flat';
import { SessionData } from '../utils/sessionData';
import fs from 'fs';
import path from 'path';

export default function recordRoutesData(outDir: string, routes: FilteredAutoRoute[], sessionData: SessionData) {
	const outFilePath: string = path.join(outDir, `${sessionData.date}.csv`);
	const resultsFileAlreadyExists: boolean = fs.existsSync(outFilePath);
	const shouldGenerateHeader: boolean = !resultsFileAlreadyExists;

	const csvRowsObjects: unknown[] = routes.map((route) => ({
		// @ts-ignore
		...flat.flatten(route),
		sessionData,
	}));

	const csvString: string = csvStringify(csvRowsObjects, {
		header: shouldGenerateHeader,
		columns: [
			'sessionData.id',
			'sessionData.date',
			'sessionData.time',
			'uuid',
			'distance',
			'duration',
			'durationInTraffic',
			'flags.blocked',
			'flags.hasTolls',
			'flags.futureBlocked',
			'flags.deadJam',
		],
		cast: {
			boolean: (value: boolean) => JSON.stringify(value),
		},
	});

	fs.appendFileSync(outFilePath, csvString);
}
