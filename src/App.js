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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSon, setSelectedSong] = useState(null);

  // Function to search lyrics from API with multiple results handling
  async function searchLyrics() {
    if (artist.trim() === "" || song.trim() === "") {
      setError("Please enter both artist and song name.");
      setLyrics("");
      setSearchResults([]);
      setSelectedSong(null);
      return;
    }
    setError("");
    setLoading(true);
    setLyrics("");
    setCopySuccess("");
    setSearchResults([]);
    setSelectedSong(null);
    try {
      // Call backend API using environment variable or relative path
      const res = await Axios.get(`${DEFAULT_PROXY_URL}/api/search`, {
        params: {
          q: `${artist} ${song}`,
        },
      });
      const hits = res.data.response.hits;
      if (hits.length === 0) {
        setError("No results found.");
        setLoading(false);
        return;
      }
      setSearchResults(hits.map((hit) => hit.result));
    } catch (err) {
      setError("Error fetching search results. Please try again.");
      setLoading(false);
    }
  }

  // Function to fetch lyrics for selected song
  async function fetchLyrics(songUrl) {
    console.log("Fetching lyrics for URL:", songUrl);
    setLoading(true);
    setLyrics("");
    setCopySuccess("");
    setError("");
    try {
      // Use REACT_APP_PROXY_URL or default to DEFAULT_PROXY_URL
      const proxyBaseUrl = process.env.REACT_APP_PROXY_URL || DEFAULT_PROXY_URL;
      const proxyUrl = `${proxyBaseUrl}/lyrics?url=${encodeURIComponent(songUrl)}`;
      const proxyRes = await Axios.get(proxyUrl);
      const lyricsText = proxyRes.data.lyrics;
      console.log("Lyrics fetched:", lyricsText ? "Yes" : "No");
      setLyrics(lyricsText);
    } catch (proxyErr) {
      console.error("Error fetching lyrics from proxy:", proxyErr);
      setError("Lyrics not found or failed to fetch from proxy.");
      setLyrics("");
    }
    setLoading(false);
  }

  // Function to handle song selection from search results
  function handleSongSelect(song) {
    console.log("Song selected:", song.full_title);
    setSelectedSong(song);
    fetchLyrics(song.url);
  }

  // Handle Enter key press to trigger search
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      searchLyrics();
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

  /* Helper function to decode HTML entities in frontend
  function decodeHtmlEntities(text) {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  }
  */

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
            onClick={searchLyrics}
            disabled={artist.trim() === "" || song.trim() === "" || loading}
          >
            {loading ? "Searching..." : "🎤 Rechercher"}
          </button>
        </div>
      </div>

      <hr />
      {error && <p className="error">{error}</p>}

      {/* Display search results for user selection */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Choisir une chanson :</h3>
          <ul>
            {searchResults.map((result) => (
              <li key={result.id} className="search-result-item">
                <button
                  className="btn search-result-btn"
                  onClick={() => handleSongSelect(result)}
                >
                  <img
                  src={`${DEFAULT_PROXY_URL}/image-proxy?url=${encodeURIComponent(result.song_art_image_thumbnail_url)}`}
                    alt={result.full_title}
                    className="search-result-thumbnail"
                  />
                  <div className="search-result-info">
                    <div className="search-result-title">
                      {result.full_title}
                    </div>
                    <div className="search-result-artist">
                      {result.primary_artist.name}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
