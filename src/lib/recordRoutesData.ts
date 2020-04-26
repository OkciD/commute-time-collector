import csvStringify from 'csv-stringify/lib/sync';
import { FilteredAutoRoute } from '../types';
import flat from 'flat';
import context from '../utils/context';
import fs from 'fs';
import path from 'path';
import { createLocalLogger, CustomizedLogger } from '../utils/logger';

const localLogger: CustomizedLogger = createLocalLogger(module);

export default function recordRoutesData(outDir: string, routes: FilteredAutoRoute[]) {
	const outFilePath: string = path.join(outDir, `${context.date}.csv`);
	const outFileAlreadyExists: boolean = fs.existsSync(outFilePath);
	const shouldGenerateHeader: boolean = !outFileAlreadyExists;

	localLogger.debug(`Output file ${outFileAlreadyExists ? 'already exists' : 'doesn\'t exist'}`, { outFilePath });

	const csvRowsObjects = routes.map((route) => flat.flatten({
		...route,
		sessionData: context,
	}));

	const csvString: string = csvStringify(csvRowsObjects, {
		header: shouldGenerateHeader,
		columns: [
			'sessionData.id',
			'sessionData.dateTime',
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
