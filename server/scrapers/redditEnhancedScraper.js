import snoowrap from 'snoowrap';

const SUBREDDITS = [
  'complaints',
  'rant',
  'mildlyinfuriating',
  'firstworldproblems',
  'technology',
  'startups',
  'entrepreneur',
  'smallbusiness',
  'investing',
  'personalfinance',
  'education',
  'healthcare',
];

const redditEnhancedScraper = async (keyword) => {
  try {
    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
      console.warn('Reddit credentials missing, skipping Reddit enhanced scraper');
      return [];
    }

    const reddit = new snoowrap({
      userAgent: 'PainPointFinder/1.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    });

    const results = await Promise.all(
      SUBREDDITS.map(async (sub) => {
        try {
          const posts = await reddit.getSubreddit(sub).search({
            query: keyword,
            sort: 'relevance',
            time: 'year',
            limit: 10,
          });

          return posts
            .filter((post) => (post.score || 0) > 10)
            .map((post) => {
              const text = [post.title, post.selftext].filter(Boolean).join(' — ');
              return {
                text: text || post.title,
                source: 'Reddit',
                subreddit: sub,
                score: post.score || 0,
                url: post.url,
              };
            });
        } catch (subErr) {
          console.warn(`Reddit enhanced r/${sub} error:`, subErr.message);
          return [];
        }
      })
    );

    return results.flat().filter((item) => item.text && item.text.length > 10);
  } catch (error) {
    console.error('Reddit enhanced scraper error:', error.message);
    return [];
  }
};

export default redditEnhancedScraper;
