import csvStringify from 'csv-stringify/lib/sync';
import { FilteredAutoRoute } from '../types';
import flat from 'flat';
import sessionData from '../utils/context';
import fs from 'fs';
import path from 'path';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';

interface CsvRowObject {
	'sessionData.id': string;
	'sessionData.date': string;
	'sessionData.time': string;
	'uuid': string;
	'distance': number;
	'duration': number;
	'durationInTraffic': number;
	'flags.blocked': boolean;
	'flags.hasTolls': boolean;
	'flags.futureBlocked': boolean;
	'flags.deadJam': boolean;
}

const localLogger: CustomizedLogger = createLocalLogger(module);

export default function recordRoutesData(outDir: string, routes: FilteredAutoRoute[]) {
	const outFilePath: string = path.join(outDir, `${sessionData.date}.csv`);
	const outFileAlreadyExists: boolean = fs.existsSync(outFilePath);
	const shouldGenerateHeader: boolean = !outFileAlreadyExists;

	localLogger.debug(`Output file ${outFileAlreadyExists ? 'already exists' : 'doesn\'t exist'}`, { outFilePath });

	const csvRowsObjects: CsvRowObject[] = routes.map((route) => ({
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
		] as (keyof CsvRowObject)[],
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
