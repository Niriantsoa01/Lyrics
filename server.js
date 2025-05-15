const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

app.use(cors());

// Simple in-memory cache for lyrics by URL
const lyricsCache = new Map();

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  return text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  }).replace(/"/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'");
}

// Endpoint to fetch lyrics page HTML and extract lyrics using cheerio with caching
app.get('/lyrics', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  if (lyricsCache.has(url)) {
    return res.json({ lyrics: lyricsCache.get(url) });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let lyricsText = "";

    // Try to extract lyrics from data-lyrics-container divs
    $('div[data-lyrics-container="true"]').each((i, elem) => {
      const text = $(elem).text();
      lyricsText += text + '\n';
    });

    // If no lyrics found, try div.lyrics
    if (lyricsText.trim() === "") {
      const lyricsDiv = $('div.lyrics').text();
      if (lyricsDiv) {
        lyricsText = lyricsDiv.trim();
      }
    }

    // If still no lyrics, try div.Lyrics__Container
    if (lyricsText.trim() === "") {
      $('div.Lyrics__Container').each((i, elem) => {
        const text = $(elem).text();
        lyricsText += text + '\n';
      });
    }

    if (lyricsText.trim() === "") {
      return res.status(404).json({ error: 'Lyrics not found on the page' });
    }

    const decodedLyrics = decodeHtmlEntities(lyricsText.trim());
    lyricsCache.set(url, decodedLyrics);

    res.json({ lyrics: decodedLyrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lyrics page' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
