import fecha from 'fecha';

export interface SessionData {
	date: string;
	time: string;
	id: string;
}

const date: Date = new Date();

const sessionData: SessionData = {
	date: fecha.format(date, 'YYYY-MM-DD'),
	time: fecha.format(date, 'HH:mm:ss'),
	id: Math.random().toString(36).substr(2, 7), // рандомный хеш
};

export default sessionData;
