import axios from 'axios';

const githubScraper = async (keyword) => {
  try {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'PainPointFinder/1.0',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get('https://api.github.com/search/issues', {
      params: {
        q: `${keyword} is:issue`,
        sort: 'comments',
        order: 'desc',
        per_page: 30,
      },
      headers,
      timeout: 15000,
    });

    const items = response.data?.items || [];

    return items
      .map((issue) => {
        const body = (issue.body || '').slice(0, 500);
        const text = [issue.title, body].filter(Boolean).join(' — ');
        return {
          text,
          source: 'GitHub',
          score: issue.comments || 0,
        };
      })
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('GitHub scraper error:', error.message);
    return [];
  }
};

export default githubScraper;
