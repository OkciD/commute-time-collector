import { performance, PerformanceEntry, PerformanceObserver, PerformanceObserverEntryList } from 'perf_hooks';
import logger from './logger';

const performanceObserver: PerformanceObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
	const entries: PerformanceEntry[] = list.getEntries();

	entries.forEach(({ name, duration, entryType }: PerformanceEntry) => {
		logger.performance(name, { duration, entryType });
	});
});

performanceObserver.observe({ entryTypes: ['measure', 'function'], buffered: true });


type AsyncFunc<A = any, R = any> = (...args: A[]) => Promise<R>;

function measuredAsyncFn<Fn extends AsyncFunc>(fn: Fn): (...args: Parameters<Fn>) => Promise<ReturnType<Fn>> {
	type A = Parameters<Fn>;
	type R = ReturnType<Fn>;

	const fnName: string = fn.name || 'Unnamed function';

	return (...args: A[]) => {
		performance.mark(`${fnName}:start`);

		return fn(...args).then((result: R) => {
			performance.mark(`${fnName}:end`);
			performance.measure(fnName, `${fnName}:start`, `${fnName}:end`);

			return result;
		});
	};
}

export default measuredAsyncFn;
