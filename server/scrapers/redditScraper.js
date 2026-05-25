import snoowrap from 'snoowrap';

const redditScraper = async (keyword) => {
  try {
    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
      console.warn('Reddit credentials missing, skipping Reddit scraper');
      return [];
    }

    const reddit = new snoowrap({
      userAgent: 'PainPointFinder/1.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    });

    const posts = await reddit.search({ query: keyword, sort: 'relevance', time: 'year', limit: 25 });

    return posts.map((post) => {
      const text = [post.title, post.selftext].filter(Boolean).join(' — ');
      return {
        text: text || post.title,
        source: 'Reddit',
        score: post.score || 0,
      };
    });
  } catch (error) {
    console.error('Reddit scraper error:', error.message);
    return [];
  }
};

export default redditScraper;
