import axios from 'axios';

const youtubeScraper = async (keyword) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key missing, skipping YouTube scraper');
      return [];
    }

    const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults: 5,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const videos = searchRes.data.items || [];
    const results = [];

    for (const video of videos) {
      const videoId = video.id.videoId;
      try {
        const commentsRes = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
          params: {
            part: 'snippet',
            videoId,
            maxResults: 10,
            order: 'relevance',
            key: process.env.YOUTUBE_API_KEY,
          },
        });

        const comments = commentsRes.data.items || [];
        for (const item of comments) {
          const snippet = item.snippet.topLevelComment.snippet;
          results.push({
            text: snippet.textDisplay,
            source: 'YouTube',
            score: snippet.likeCount || 0,
          });
        }
      } catch (commentErr) {
        console.warn(`YouTube comments unavailable for ${videoId}:`, commentErr.message);
      }
    }

    return results;
  } catch (error) {
    console.error('YouTube scraper error:', error.message);
    return [];
  }
};

export default youtubeScraper;
