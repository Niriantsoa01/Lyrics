import "./App.css";
import Axios from "axios";
import { useState } from "react";

function App() {
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  function searchLyrics() {
    if (artist.trim() === "" || song.trim() === "") {
      setError("Please enter both artist and song title.");
      setLyrics("");
      return;
    }
    setError("");
    setLoading(true);
    Axios.get(`https://api.lyrics.ovh/v1/${artist}/${song}`)
      .then((res) => {
        setLyrics(res.data.lyrics || "Lyrics not found.");
        setLoading(false);
      })
      .catch(() => {
        setError("Lyrics n'existe pas. Essayez un autre titre.");
        setLyrics("");
        setLoading(false);
      });
  }

  function clearFields() {
    setArtist("");
    setSong("");
    setLyrics("");
    setError("");
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  return (
    <div className={darkMode ? "App dark-mode" : "App"}>
      <header>
        <h1>Trouver Parole</h1>
      <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
        {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
      </button>
      </header>
      <div className="row mb-3 g-3 justify-content-center">
        <div className="col-4">
          <h2>Artiste</h2>
          <input
            className="form-control"
            type="text"
            placeholder="Artiste"
            value={artist}
            onChange={(e) => {
              setArtist(e.target.value);
            }}
          />
        </div>
        <div className="col-4">
          <h2>Titre</h2>
          <input
            className="form-control"
            type="text"
            placeholder="Titre"
            value={song}
            onChange={(e) => {
              setSong(e.target.value);
            }}
          />
        </div>
        <div className="col-2 actions-col">
          <h2>Action</h2>
          <button className="btn btn-primary" onClick={searchLyrics} disabled={loading} aria-label="Search lyrics">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
          </button>
          <button className="btn btn-secondary clear-btn" onClick={clearFields} disabled={loading} aria-label="Clear fields">
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
        <hr />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="lyrics-container">
      {lyrics && (
          <button
            className="btn btn-copy text-white"
            onClick={() => {
              navigator.clipboard.writeText(lyrics);
              alert("Lyrics copied to clipboard!");
            }}
            aria-label="Copy lyrics"
          >
            <i className="fas fa-copy fs-4"></i>
          </button>
        )}
        <pre className="lyrics-display">{lyrics}</pre>
      </div>
    </div>
  );
}

export default App;
