import redditScraper from './redditScraper.js';
import redditEnhancedScraper from './redditEnhancedScraper.js';
import youtubeScraper from './youtubeScraper.js';
import newsScraper from './newsScraper.js';
import stackExchangeScraper from './stackExchangeScraper.js';
import hackerNewsScraper from './hackerNewsScraper.js';
import githubScraper from './githubScraper.js';
import googleNewsScraper from './googleNewsScraper.js';
import productHuntScraper from './productHuntScraper.js';
import appleScraper from './appleScraper.js';
import bingNewsScraper from './bingNewsScraper.js';
import trustpilotEnhancedScraper from './trustpilotEnhancedScraper.js';
import googlePlayScraper from './googlePlayScraper.js';
import amazonScraper from './amazonScraper.js';
import apifyScraper from './apifyScraper.js';

const hasKeys = (keys) => keys.every((key) => Boolean(process.env[key]));

const SCRAPER_REGISTRY = [
  { id: 'reddit', label: 'Reddit', run: redditScraper, requiredKeys: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'] },
  { id: 'redditEnhanced', label: 'Reddit', run: redditEnhancedScraper, requiredKeys: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET'] },
  { id: 'youtube', label: 'YouTube', run: youtubeScraper, requiredKeys: ['YOUTUBE_API_KEY'] },
  { id: 'newsapi', label: 'NewsAPI', run: newsScraper, requiredKeys: ['NEWS_API_KEY'] },
  { id: 'stackexchange', label: 'StackExchange', run: stackExchangeScraper, requiredKeys: [] },
  { id: 'hackernews', label: 'HackerNews', run: hackerNewsScraper, requiredKeys: [] },
  { id: 'github', label: 'GitHub', run: githubScraper, requiredKeys: [] },
  { id: 'googlenews', label: 'GoogleNews', run: googleNewsScraper, requiredKeys: [] },
  { id: 'producthunt', label: 'ProductHunt', run: productHuntScraper, requiredKeys: ['PRODUCT_HUNT_API_KEY'] },
  { id: 'appstore', label: 'AppStore', run: appleScraper, requiredKeys: [] },
  { id: 'bingnews', label: 'BingNews', run: bingNewsScraper, requiredKeys: ['BING_API_KEY'] },
  { id: 'trustpilotEnhanced', label: 'Trustpilot', run: trustpilotEnhancedScraper, requiredKeys: ['APIFY_API_TOKEN'] },
  { id: 'playstore', label: 'PlayStore', run: googlePlayScraper, requiredKeys: ['APIFY_API_TOKEN'] },
  { id: 'amazon', label: 'Amazon', run: amazonScraper, requiredKeys: ['APIFY_API_TOKEN'] },
  { id: 'apify', label: 'Trustpilot', run: apifyScraper, requiredKeys: ['APIFY_API_TOKEN'] },
];

const buildSourceBreakdown = (items) => {
  const breakdown = {};
  for (const item of items) {
    const source = item.source || 'Unknown';
    breakdown[source] = (breakdown[source] || 0) + 1;
  }
  return breakdown;
};

export const runAllScrapers = async (keyword) => {
  const eligible = SCRAPER_REGISTRY.filter(
    (scraper) => scraper.requiredKeys.length === 0 || hasKeys(scraper.requiredKeys)
  );

  const skipped = SCRAPER_REGISTRY.filter((scraper) => !eligible.includes(scraper));

  skipped.forEach((scraper) => {
    console.warn(
      `Skipping ${scraper.id} scraper — missing keys: ${scraper.requiredKeys.join(', ') || 'none'}`
    );
  });

  console.log(`Running ${eligible.length} out of ${SCRAPER_REGISTRY.length} scrapers`);

  const results = await Promise.allSettled(
    eligible.map(async (scraper) => {
      const data = await scraper.run(keyword);
      return { id: scraper.id, label: scraper.label, data: data || [] };
    })
  );

  const succeeded = [];
  const failed = [];
  const merged = [];

  results.forEach((result, index) => {
    const scraper = eligible[index];
    if (result.status === 'fulfilled') {
      const count = result.value.data.length;
      if (count > 0) {
        succeeded.push({ id: scraper.id, label: scraper.label, count });
        merged.push(...result.value.data);
      } else {
        console.warn(`${scraper.id} scraper returned 0 results`);
      }
    } else {
      failed.push({ id: scraper.id, reason: result.reason?.message || 'Unknown error' });
      console.error(`${scraper.id} scraper failed:`, result.reason?.message);
    }
  });

  const sourceBreakdown = buildSourceBreakdown(merged);

  console.log('Scraper success:', succeeded.map((s) => `${s.id}(${s.count})`).join(', ') || 'none');
  if (failed.length) {
    console.log('Scraper failures:', failed.map((f) => f.id).join(', '));
  }
  console.log('Source breakdown:', sourceBreakdown);

  return {
    items: merged.filter((item) => item.text && String(item.text).length > 10),
    sourceBreakdown,
    scraperStats: {
      total: SCRAPER_REGISTRY.length,
      ran: eligible.length,
      succeeded: succeeded.length,
      failed: failed.length,
      details: succeeded,
      failures: failed,
    },
  };
};

export default { runAllScrapers, SCRAPER_REGISTRY };
