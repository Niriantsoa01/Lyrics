require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

// Simple in-memory cache for lyrics by artist-title key
const lyricsCache = new Map();

// Endpoint to fetch lyrics from Lyrics.ovh API with caching
app.get('/lyrics', async (req, res) => {
  const { artist, title } = req.query;
  if (!artist || !title) {
    return res.status(400).json({ error: 'Missing artist or title parameter' });
  }

  const cacheKey = `${artist.toLowerCase()}-${title.toLowerCase()}`;
  if (lyricsCache.has(cacheKey)) {
    return res.json({ lyrics: lyricsCache.get(cacheKey) });
  }

  try {
    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const lyrics = response.data.lyrics;
    if (!lyrics) {
      return res.status(404).json({ error: 'Lyrics not found' });
    }
    lyricsCache.set(cacheKey, lyrics);
    res.json({ lyrics });
  } catch (error) {
    console.error('Error fetching lyrics from Lyrics.ovh:', {
      message: error.message,
      responseStatus: error.response ? error.response.status : null,
      responseData: error.response ? error.response.data : null,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// Keep /image-proxy endpoint as is
app.get('/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
