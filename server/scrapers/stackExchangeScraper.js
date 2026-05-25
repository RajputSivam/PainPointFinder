import axios from 'axios';

const stackExchangeScraper = async (keyword) => {
  try {
    const response = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
      params: {
        order: 'desc',
        sort: 'votes',
        site: 'stackoverflow',
        pagesize: 25,
        q: keyword,
      },
    });

    const questions = response.data.items || [];

    return questions.map((q) => ({
      text: `${q.title || ''} ${q.body ? q.body.replace(/<[^>]*>/g, '') : ''}`.trim(),
      source: 'StackExchange',
      score: q.score || 0,
    }));
  } catch (error) {
    console.error('StackExchange scraper error:', error.message);
    return [];
  }
};

export default stackExchangeScraper;
