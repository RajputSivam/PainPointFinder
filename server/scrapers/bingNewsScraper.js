import axios from 'axios';

const bingNewsScraper = async (keyword) => {
  try {
    if (!process.env.BING_API_KEY) {
      console.warn('BING_API_KEY missing, skipping Bing News scraper');
      return [];
    }

    const response = await axios.get('https://api.bing.microsoft.com/v7.0/news/search', {
      params: { q: keyword, count: 20, mkt: 'en-US' },
      headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY },
      timeout: 15000,
    });

    const articles = response.data?.value || [];

    return articles
      .map((article) => ({
        text: `${article.name || ''} ${article.description || ''}`.trim(),
        source: 'BingNews',
        score: 1,
      }))
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('Bing News scraper error:', error.message);
    return [];
  }
};

export default bingNewsScraper;
