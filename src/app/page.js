"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-purple-200">
      <header className="w-full py-8 sm:py-10 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white text-center drop-shadow-lg">YouTube MP3 Downloader</h1>
        <p className="text-center text-white/80 mt-1 sm:mt-2 text-base sm:text-lg">Search and download YouTube audio as MP3 instantly!</p>
      </header>
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-xl px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mb-6 sm:mb-8">
            <input
              className="flex-1 border-2 border-blue-400 focus:border-purple-500 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-base sm:text-lg shadow transition-all outline-none"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search YouTube..."
              onKeyDown={e => e.key === 'Enter' && search()}
              disabled={loading}
            />
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold shadow hover:scale-105 transition-all text-base sm:text-lg"
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
          {error && <div className="text-red-600 mb-4 text-center text-sm sm:text-base">{error}</div>}
          <div className="grid gap-4 sm:gap-6">
            {results.map(v => (
              <div
                key={v.videoId}
                className="bg-white rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-3 sm:p-4 hover:shadow-2xl transition-shadow"
              >
                <img src={v.thumbnail} width={240} height={136} alt="thumbnail" className="rounded-lg shadow w-full sm:w-[120px] h-auto object-cover" />
                <div className="flex-1 w-full">
                  <div className="font-semibold text-base sm:text-lg mb-2 line-clamp-2 text-center sm:text-left">{v.title}</div>
                  <div className="flex justify-center sm:justify-start">
                    <button
                      className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold shadow hover:scale-105 transition-all text-sm sm:text-base"
                      onClick={() => download(v.videoId, v.title)}
                      disabled={downloading === v.videoId}
                    >
                      {downloading === v.videoId ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Downloading...
                        </span>
                      ) : "Download MP3"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="w-full py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center shadow-lg text-sm sm:text-base">
        &copy; {new Date().getFullYear()} Made by Anish Shrestha
      </footer>
    </div>
  );
}
