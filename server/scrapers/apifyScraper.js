import { ApifyClient } from 'apify-client';

const apifyScraper = async (keyword) => {
  try {
    if (!process.env.APIFY_API_TOKEN) {
      console.warn('Apify token missing, skipping Apify scraper');
      return [];
    }

    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    const run = await client.actor('apify/trustpilot-scraper').call({
      search: keyword,
      maxReviews: 20,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return (items || []).map((item) => ({
      text: item.text || item.reviewText || item.title || String(item),
      source: 'Trustpilot',
      score: item.rating || item.stars || 0,
    }));
  } catch (error) {
    console.error('Apify scraper error:', error.message);
    return [];
  }
};

export default apifyScraper;
