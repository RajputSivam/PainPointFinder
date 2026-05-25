import axios from 'axios';

const appleScraper = async (keyword) => {
  try {
    const searchRes = await axios.get('https://itunes.apple.com/search', {
      params: { term: keyword, entity: 'software', limit: 5, country: 'us' },
      timeout: 15000,
    });

    const apps = searchRes.data?.results || [];
    const results = [];

    for (const app of apps.slice(0, 3)) {
      try {
        const reviewsRes = await axios.get(
          `https://itunes.apple.com/us/rss/customerreviews/id=${app.trackId}/sortBy=mostRecent/json`,
          { timeout: 10000 }
        );

        const entries = reviewsRes.data?.feed?.entry || [];
        const reviewList = Array.isArray(entries) ? entries : entries ? [entries] : [];

        for (const entry of reviewList.slice(0, 10)) {
          if (!entry['im:rating']) continue;
          const title = entry.title?.label || '';
          const content = entry.content?.label || '';
          const rating = Number(entry['im:rating']?.label || 0);
          results.push({
            text: `${title} ${content}`.trim(),
            source: 'AppStore',
            score: rating,
          });
        }
      } catch (reviewErr) {
        console.warn(`AppStore reviews for ${app.trackName}:`, reviewErr.message);
      }
    }

    return results.filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('Apple App Store scraper error:', error.message);
    return [];
  }
};

export default appleScraper;
