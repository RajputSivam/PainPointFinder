import axios from 'axios';

const productHuntScraper = async (keyword) => {
  try {
    if (!process.env.PRODUCT_HUNT_API_KEY) {
      console.warn('PRODUCT_HUNT_API_KEY missing, skipping Product Hunt scraper');
      return [];
    }

    const query = `
      query SearchPosts($query: String!) {
        posts(search: $query, first: 20) {
          edges {
            node {
              name
              tagline
              description
              votesCount
              commentsCount
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.producthunt.com/v2/api/graphql',
      { query, variables: { query: keyword } },
      {
        headers: {
          Authorization: `Bearer ${process.env.PRODUCT_HUNT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const edges = response.data?.data?.posts?.edges || [];

    return edges
      .map(({ node }) => {
        const text = [node.name, node.tagline, node.description].filter(Boolean).join(' — ');
        return {
          text,
          source: 'ProductHunt',
          score: node.votesCount || node.commentsCount || 0,
        };
      })
      .filter((item) => item.text.length > 10);
  } catch (error) {
    console.error('Product Hunt scraper error:', error.message);
    return [];
  }
};

export default productHuntScraper;
