import axios from "axios";

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  const GENIUS_API_KEY = process.env.GENIUS_API_KEY;
  if (!GENIUS_API_KEY) {
    return res.status(500).json({ error: "Missing Genius API key" });
  }

  try {
    const response = await axios.get("https://api.genius.com/search", {
      params: { q },
      headers: {
        Authorization: `Bearer ${GENIUS_API_KEY}`,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching search results" });
  }
}
