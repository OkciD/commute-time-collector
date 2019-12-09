import scrapePageData from './lib/scrapePageData';

(async (): Promise<void> => {
	console.log(await scrapePageData());
})().catch((error) => {
	console.error(error);
});
