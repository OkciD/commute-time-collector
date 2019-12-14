import minimist from 'minimist';

interface Args extends minimist.ParsedArgs {
	logsDir: string;
}

const args: Args = minimist<Args>(process.argv.slice(2));

export default args;
