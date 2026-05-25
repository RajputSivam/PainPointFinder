import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const googleNewsScraper = async (keyword) => {
  try {
    const response = await axios.get('https://news.google.com/rss/search', {
      params: { q: keyword, hl: 'en-US', gl: 'US', ceid: 'US:en' },
      timeout: 15000,
      headers: { 'User-Agent': 'PainPointFinder/1.0' },
    });

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(response.data);
    const channel = parsed?.rss?.channel || parsed?.feed;
    let items = channel?.item || [];
    if (!Array.isArray(items)) items = items ? [items] : [];

    return items
      .slice(0, 20)
      .map((item) => {
        const title = item.title || '';
        const description = item.description || item['content:encoded'] || '';
        const cleanDesc = String(description).replace(/<[^>]*>/g, '').trim();
        return {
          text: `${title} ${cleanDesc}`.trim(),
          source: 'GoogleNews',
          score: 1,
        };
      })
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('GoogleNews scraper error:', error.message);
    return [];
  }
};

export default googleNewsScraper;
