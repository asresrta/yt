"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
    else setTheme("light");
  }, []);

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const search = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.videos || []);
    } catch (e) {
      setError("Search failed.");
    }
    setLoading(false);
  };

  const download = async (videoId, title) => {
    setDownloading(videoId);
    setError("");
    try {
      const res = await fetch(`/api/download?videoId=${videoId}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.mp3`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError("Download failed.");
    }
    setDownloading(null);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300`}>
      <header className="w-full py-8 sm:py-10 flex flex-col items-center bg-transparent mb-6 sm:mb-8 relative">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">YouTube MP3</h1>
        <p className="text-center text-gray-300 dark:text-gray-400 mt-2 text-base sm:text-lg">Search, play, and download YouTube audio in style.</p>
        <button
          aria-label="Toggle theme"
          className="absolute right-6 top-6 text-2xl p-2 rounded-full bg-gradient-to-tr from-gray-200/80 to-gray-400/80 dark:from-gray-800/80 dark:to-gray-900/80 shadow hover:scale-110 transition"
          onClick={toggleTheme}
        >
          {theme === "dark" ? "🌞" : "🌙"}
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full px-4 sm:px-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex flex-row gap-2 mb-8 justify-center">
              <input
                className="flex-1 rounded-full px-5 py-3 text-lg bg-[#23232b] dark:bg-[#23232b] text-white dark:text-white border-none focus:ring-2 focus:ring-pink-400 shadow-lg placeholder:text-gray-400 outline-none"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search YouTube videos..."
                onKeyDown={e => e.key === 'Enter' && search()}
                disabled={loading}
              />
              <button
                className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg"
                onClick={search}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Searching...
                  </span>
                ) : "Search"}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 mb-4 text-center text-base">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
            {results.map(v => (
              <div key={v.videoId} className="flex flex-col items-center bg-[#23232b] border-2 border-[#393943] rounded-xl shadow p-4 w-full h-full">
                {previewing === v.videoId ? (
                  <div className="w-full mb-3">
                    <div className="aspect-video w-full mb-3 h-40">
                      <iframe
                        width="100%"
                        height="160"
                        src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg w-full h-full"
                      ></iframe>
                    </div>
                    <button
                      className="mb-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      onClick={() => setPreviewing(null)}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <img src={v.thumbnail} width={240} height={136} alt="thumbnail" className="w-full h-40 object-cover rounded-lg border-2 border-[#393943] mb-3" />
                )}
                <div className="font-bold text-lg text-white text-center mb-1 leading-tight">{v.title}</div>
                <div className="text-base text-gray-300 text-center mb-3">{v.channelTitle}</div>
                <div className="flex flex-row gap-2 w-full mt-auto">
                  <button
                    className="flex-1 py-2 text-base rounded-full font-semibold bg-gradient-to-r from-yellow-400 to-pink-400 text-white"
                    onClick={() => setPreviewing(v.videoId)}
                    disabled={previewing === v.videoId}
                  >
                    Play
                  </button>
                  <button
                    className="flex-1 py-2 text-base rounded-full font-semibold border-2 border-yellow-400 text-yellow-300 bg-transparent"
                    onClick={() => download(v.videoId, v.title)}
                    disabled={downloading === v.videoId}
                  >
                    {downloading === v.videoId ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></span>
                        Downloading MP3...
                      </span>
                    ) : "Download MP3"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="w-full py-6 text-gray-400 text-center text-base mt-10">
        &copy; {new Date().getFullYear()} YouTube MP3 Premium. Not affiliated with YouTube.
      </footer>
    </div>
  );
}
