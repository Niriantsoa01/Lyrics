import axios from "axios";
import cheerio from "cheerio";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  if (lyricsCache.has(url)) {
    return res.status(200).json({ lyrics: lyricsCache.get(url) });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let lyricsText = "";

    // Try to extract lyrics from data-lyrics-container divs
    $('div[data-lyrics-container="true"]').each((i, elem) => {
      const text = $(elem).text();
      lyricsText += text + "\n";
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
        lyricsText += text + "\n";
      });
    }

    if (lyricsText.trim() === "") {
      return res.status(404).json({ error: "Lyrics not found on the page" });
    }

    const decodedLyrics = decodeHtmlEntities(lyricsText.trim());
    lyricsCache.set(url, decodedLyrics);

    res.status(200).json({ lyrics: decodedLyrics });
  } catch (error) {
    console.error("Error fetching lyrics page:", {
      message: error.message,
      responseStatus: error.response ? error.response.status : null,
      responseData: error.response ? error.response.data : null,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to fetch lyrics page" });
  }
}
