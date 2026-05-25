import { ApifyClient } from 'apify-client';

const amazonScraper = async (keyword) => {
  try {
    if (!process.env.APIFY_API_TOKEN) {
      console.warn('APIFY_API_TOKEN missing, skipping Amazon scraper');
      return [];
    }

    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    const run = await client.actor('junglee/amazon-reviews-scraper').call({
      search: keyword,
      maxReviews: 30,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return (items || [])
      .filter((item) => {
        const rating = Number(item.rating || item.stars || item.score || 5);
        return rating <= 2;
      })
      .map((item) => ({
        text: `${item.title || ''} ${item.text || item.reviewText || ''}`.trim(),
        source: 'Amazon',
        score: Number(item.helpfulVotes || item.helpful || item.votes || 0),
      }))
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('Amazon scraper error:', error.message);
    return [];
  }
};

export default amazonScraper;
