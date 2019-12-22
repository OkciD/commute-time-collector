import csvStringify from 'csv-stringify/lib/sync';
import { FilteredAutoRoute } from '../types';
import flat from 'flat';
import sessionData from '../utils/sessionData';
import fs from 'fs';
import path from 'path';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';

const localLogger: CustomizedLogger = createLocalLogger(module);

export default function recordRoutesData(outDir: string, routes: FilteredAutoRoute[]) {
	const outFilePath: string = path.join(outDir, `${sessionData.date}.csv`);
	const outFileAlreadyExists: boolean = fs.existsSync(outFilePath);
	const shouldGenerateHeader: boolean = !outFileAlreadyExists;

	localLogger.debug(`Output file ${outFileAlreadyExists ? 'already exists' : 'doesn\'t exist'}`, { outFilePath });

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
	localLogger.debug('Generated CSV', { csv: csvString });

	if (!fs.existsSync(outDir)) {
		localLogger.debug('Output dir doesn\'t exist, creating it', { outDir });
		fs.mkdirSync(outDir, { recursive: true });
	}

	fs.appendFileSync(outFilePath, csvString);
	localLogger.debug('Successfully written data to file', { outFilePath });
}
