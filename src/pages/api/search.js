const ytsr = require('ytsr');

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const searchResults = await ytsr(q, { limit: 10 });
    const videos = searchResults.items
      .filter(item => item.type === 'video')
      .map(item => ({
        title: item.title,
        videoId: item.id,
        thumbnail: item.bestThumbnail.url,
      }));
    res.status(200).json({ videos });
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
} 