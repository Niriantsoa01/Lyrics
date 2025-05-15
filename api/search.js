import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  const GENIUS_API_KEY = process.env.GENIUS_API_KEY;
  if (!GENIUS_API_KEY) {
    console.error("Missing Genius API key in environment variables");
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
    console.error("Error fetching search results:", {
      message: error.message,
      responseStatus: error.response ? error.response.status : null,
      responseData: error.response ? error.response.data : null,
      stack: error.stack,
    });
    if (error.response) {
      console.error("Full error response data:", error.response.data);
    }
    res.status(500).json({
      error: "Error fetching search results",
      details: error.response ? error.response.data : error.message,
    });
  }
}
