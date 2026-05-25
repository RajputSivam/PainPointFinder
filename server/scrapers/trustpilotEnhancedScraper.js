import { ApifyClient } from 'apify-client';

const trustpilotEnhancedScraper = async (keyword) => {
  try {
    if (!process.env.APIFY_API_TOKEN) {
      console.warn('APIFY_API_TOKEN missing, skipping Trustpilot enhanced scraper');
      return [];
    }

    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    const run = await client.actor('apify/trustpilot-scraper').call({
      search: keyword,
      maxReviews: 50,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return (items || [])
      .filter((item) => {
        const rating = Number(item.rating || item.stars || item.score || 5);
        return rating <= 2;
      })
      .map((item) => ({
        text: item.text || item.reviewText || item.title || String(item),
        source: 'Trustpilot',
        score: Number(item.rating || item.stars || 1),
        company: item.companyName || item.company || item.businessName || '',
      }))
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('Trustpilot enhanced scraper error:', error.message);
    return [];
  }
};

export default trustpilotEnhancedScraper;
