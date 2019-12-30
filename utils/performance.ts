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
type SyncFunc<A = any, R = any> = (...args: A[]) => R;

export function measuredAsyncFn<Fn extends AsyncFunc>(fn: Fn): (...args: Parameters<Fn>) => Promise<ReturnType<Fn>> {
	const fnTag: string = fn.name || fn.toString().slice(0, 20);

	return async (...args: Parameters<Fn>) => {
		performance.mark(`${fnTag}:start`);

		const result: ReturnType<Fn> = await fn(...args);

		performance.mark(`${fnTag}:end`);
		performance.measure(fnTag, `${fnTag}:start`, `${fnTag}:end`);

		return result;
	};
}

export const measuredSyncFn: <Fn extends SyncFunc>(fn: Fn) => Fn = performance.timerify;
