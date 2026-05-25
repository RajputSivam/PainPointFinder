import axios from 'axios';

const newsScraper = async (keyword) => {
  try {
    if (!process.env.NEWS_API_KEY) {
      console.warn('NewsAPI key missing, skipping News scraper');
      return [];
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: keyword,
        pageSize: 20,
        sortBy: 'relevancy',
        language: 'en',
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    const articles = response.data.articles || [];

    return articles.map((article) => ({
      text: `${article.title || ''} ${article.description || ''}`.trim(),
      source: 'NewsAPI',
      score: 0,
    }));
  } catch (error) {
    console.error('News scraper error:', error.message);
    return [];
  }
};

export default newsScraper;
