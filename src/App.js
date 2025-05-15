import "./App.css";
import Axios from "axios";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

// Enregistrer l'icône dans la bibliothèque
library.add(faCopy);

const DEFAULT_PROXY_URL = process.env.REACT_APP_PROXY_URL || "https://lyrics-back-9o6c.onrender.com";

function App() {
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  // Function to fetch lyrics from backend using artist and song title
  async function fetchLyrics() {
    if (artist.trim() === "" || song.trim() === "") {
      setError("Please enter both artist and song name.");
      setLyrics("");
      return;
    }
    setError("");
    setLoading(true);
    setLyrics("");
    setCopySuccess("");
    try {
      const proxyBaseUrl = process.env.REACT_APP_PROXY_URL || DEFAULT_PROXY_URL;
      const proxyUrl = `${proxyBaseUrl}/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(song)}`;
      const proxyRes = await Axios.get(proxyUrl);
      const lyricsText = proxyRes.data.lyrics;
      if (!lyricsText) {
        setError("Lyrics not found.");
        setLyrics("");
      } else {
        setLyrics(lyricsText);
      }
    } catch (proxyErr) {
      console.error("Error fetching lyrics from proxy:", proxyErr);
      setError("Lyrics not found or failed to fetch from proxy.");
      setLyrics("");
    }
    setLoading(false);
  }

  // Handle Enter key press to trigger fetchLyrics
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      fetchLyrics();
    }
  }

  // Function to copy lyrics to clipboard
  function copyLyrics() {
    if (!lyrics) return;
    navigator.clipboard
      .writeText(lyrics)
      .then(() => {
        setCopySuccess("Lyrics copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 4000);
      })
      .catch(() => {
        setCopySuccess("Failed to copy lyrics.");
        setTimeout(() => setCopySuccess(""), 3000);
      });
  }

  function formatLyrics(lyrics) {
    // Split lyrics into lines
    const lines = lyrics.split('\\n');

    const sectionTitleRegex = /^\\[(couplet|verset|refrain)[^\\]]*\\]/i;

    // Render each line as a paragraph, with special class for section titles
    return lines.map((line, index) => {
      if (sectionTitleRegex.test(line)) {
        return (
          <p key={index} className="lyrics-section-title">
            {line}
          </p>
        );
      } else {
        return (
          <p key={index} className="lyrics-line">
            {line}
          </p>
        );
      }
    });
  }

  return (
    <div className="App-container text-center">
      <h1 className="mt-3">Trouver Lyrics</h1>

      <div className="input-row row mx-auto mt-3">
        <div className="col">
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Nom de l'artiste"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="col">
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Titre de la chanson"
            value={song}
            onChange={(e) => setSong(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="col">
          <button
            className="btn btn-primary cursor-pointer"
            onClick={fetchLyrics}
            disabled={artist.trim() === "" || song.trim() === "" || loading}
          >
            {loading ? "Loading..." : "🎤 Rechercher"}
          </button>
        </div>
      </div>

      <hr />
      {error && <p className="error">{error}</p>}

      <div className="lyrics-container mt-3">
        <div className="lyrics-text">
          {lyrics ? formatLyrics(lyrics) : "Les Lyrics s'affichent ici ..."}
        </div>
        {lyrics && (
          <button
            className="btn btn-primary copy-btn mt-4"
            onClick={copyLyrics}
            title="Copy Lyrics"
          >
            <FontAwesomeIcon icon="fa-solid fa-copy" />
            <span>Copier Lyrics</span>
          </button>
        )}
        {copySuccess && (
          <p className="copy-success text-success mt-3">{copySuccess}</p>
        )}
      </div>
    </div>
  );
}

export default App;
