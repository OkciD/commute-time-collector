import fecha from 'fecha';

class Context {
	public date: string = '';
	public time: string = '';
	public id: string = '';

	constructor() {
		this.init();
	}

	public init() {
		const date: Date = new Date();

		this.date = fecha.format(date, 'YYYY-MM-DD');
		this.time = fecha.format(date, 'HH:mm:ss');
		this.id = Math.random().toString(36).substr(2, 7);
	}
}

export default new Context();
