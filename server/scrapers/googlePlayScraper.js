import { ApifyClient } from 'apify-client';

const googlePlayScraper = async (keyword) => {
  try {
    if (!process.env.APIFY_API_TOKEN) {
      console.warn('APIFY_API_TOKEN missing, skipping Google Play scraper');
      return [];
    }

    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    const run = await client.actor('epctex/google-play-scraper').call({
      search: keyword,
      maxReviews: 30,
      scrapeReviews: true,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return (items || [])
      .filter((item) => {
        const rating = Number(item.score || item.rating || item.stars || 5);
        return rating <= 2;
      })
      .map((item) => ({
        text: item.text || item.reviewText || item.content || String(item),
        source: 'PlayStore',
        score: Number(item.thumbsUpCount || item.likes || item.score || 0),
      }))
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('Google Play scraper error:', error.message);
    return [];
  }
};

export default googlePlayScraper;
