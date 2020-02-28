import fecha from 'fecha';

export interface Context {
	date: string;
	time: string;
	id: string;
}

const date: Date = new Date();

const context: Context = {
	date: fecha.format(date, 'YYYY-MM-DD'),
	time: fecha.format(date, 'HH:mm:ss'),
	id: Math.random().toString(36).substr(2, 7), // рандомный хеш
};

export default context;
