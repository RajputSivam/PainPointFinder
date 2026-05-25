import axios from 'axios';

const hackerNewsScraper = async (keyword) => {
  try {
    const response = await axios.get('https://hn.algolia.com/api/v1/search', {
      params: {
        query: keyword,
        tags: 'story',
        hitsPerPage: 30,
      },
      timeout: 15000,
    });

    const hits = response.data?.hits || [];

    return hits
      .map((item) => {
        const text = [item.title, item.story_text].filter(Boolean).join(' — ');
        return {
          text: text || item.title || '',
          source: 'HackerNews',
          score: item.points || 0,
        };
      })
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('HackerNews scraper error:', error.message);
    return [];
  }
};

export default hackerNewsScraper;
