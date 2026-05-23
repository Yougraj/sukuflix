"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  History,
  Settings,
  Play,
  LayoutGrid,
  Cpu,
  Heart,
  X,
  SearchIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SukuFlix() {
  const [view, setView] = useState<
    "home" | "search" | "history" | "genre" | "settings" | "advanced"
  >("home");
  const [showIntro, setShowIntro] = useState(true);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem("suku_history") || "[]"));
    fetchContent("all");
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchContent = async (genre = "all", q = "") => {
    setLoading(true);
    const selectors = JSON.parse(
      localStorage.getItem("suku_selectors") || "null",
    );
    const res = await fetch("/api/scrape", {
      method: "POST",
      body: JSON.stringify({ action: "search", query: q, genre, selectors }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const openDrama = (item: any) => {
    const newHistory = [
      item,
      ...history.filter((h: any) => h.title !== item.title),
    ].slice(0, 20);
    localStorage.setItem("suku_history", JSON.stringify(newHistory));
    router.push(`/watch?title=${encodeURIComponent(item.title)}`);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* 1. Cinematic Intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-rose-600 mb-6"
            >
              <Heart fill="currentColor" size={80} />
            </motion.div>
            <h1 className="text-3xl font-black italic text-rose-100">
              WELCOME HOME, SUKU ❤️
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Navigation */}
      <nav className="p-6 sticky top-0 bg-[#141414]/90 backdrop-blur-lg z-50 flex justify-between items-center border-b border-white/5">
        <h1 className="text-rose-600 text-2xl font-black italic tracking-tighter">
          SUKU FLIX
        </h1>
        <div className="flex gap-4 items-center">
          {view === "search" && (
            <input
              autoFocus
              placeholder="Search dramas..."
              className="bg-zinc-900 px-4 py-2 rounded-full text-sm outline-none ring-1 ring-rose-500/30 w-40 md:w-64"
              onChange={(e) => {
                setQuery(e.target.value);
                fetchContent("all", e.target.value);
              }}
            />
          )}
          <button
            onClick={() => setView(view === "search" ? "home" : "search")}
            className="text-zinc-400 p-2"
          >
            {view === "search" ? <X /> : <SearchIcon />}
          </button>
        </div>
      </nav>

      <main className="p-4 md:p-8 pb-32">
        {/* Home & Search Results View */}
        {(view === "home" || view === "search") && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">
                {view === "search" ? "Search Results" : "Trending Now"}
              </h2>
              {loading && (
                <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {results.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openDrama(item)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 bg-rose-600 text-[10px] font-black px-2 py-0.5 rounded shadow-lg">
                      {item.ep}
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] font-bold truncate text-zinc-300 group-hover:text-rose-500 transition">
                    {item.title}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* History View */}
        {view === "history" && (
          <section className="max-w-4xl mx-auto">
            <h2 className="text-rose-500 text-xs font-black uppercase tracking-[0.3em] mb-8">
              Resume Watching
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item: any, i: number) => (
                <div
                  key={i}
                  onClick={() => openDrama(item)}
                  className="bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 p-2 rounded-2xl flex gap-4 items-center transition cursor-pointer group"
                >
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                      <Play size={20} fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden pr-2">
                    <p className="font-bold text-sm truncate">{item.title}</p>
                    <p className="text-rose-500 text-[10px] font-black uppercase mt-2">
                      Resume Watching &rarr;
                    </p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-zinc-600 text-center col-span-2 py-20 italic">
                  No history yet...
                </p>
              )}
            </div>
          </section>
        )}

        {/* Settings View */}
        {view === "settings" && (
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold mb-8 text-center uppercase tracking-widest text-zinc-500">
              My Profile
            </h2>
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 text-center">
              <div className="w-20 h-20 bg-rose-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black italic shadow-xl shadow-rose-900/20">
                S
              </div>
              <p className="font-bold text-lg">Sudarshona</p>
              <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest">
                Premium Account
              </p>
            </div>
            <button
              onClick={() => setView("advanced")}
              className="w-full bg-zinc-900/50 p-5 rounded-2xl flex justify-between items-center text-zinc-400 hover:text-white border border-white/5 transition"
            >
              <span className="text-sm font-bold">Advanced Scraper Magic</span>
              <Cpu size={18} />
            </button>
          </div>
        )}

        {/* Advanced Scraper Settings */}
        {view === "advanced" && <AdvancedSettings setView={setView} />}

        {/* Genre View */}
        {view === "genre" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-8 text-center text-zinc-500 uppercase tracking-widest">
              Select Genre
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["drama", "movie", "ongoing", "hollywood"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    fetchContent(g);
                    setView("home");
                  }}
                  className="bg-zinc-900 p-8 rounded-3xl text-lg font-black uppercase tracking-tighter hover:bg-rose-600 transition"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-full px-10 py-4 flex justify-between shadow-2xl z-[60]">
        <NavIcon
          icon={<Home />}
          active={view === "home"}
          onClick={() => {
            setView("home");
            fetchContent();
          }}
        />
        <NavIcon
          icon={<LayoutGrid />}
          active={view === "genre"}
          onClick={() => setView("genre")}
        />
        <NavIcon
          icon={<History />}
          active={view === "history"}
          onClick={() => setView("history")}
        />
        <NavIcon
          icon={<Settings />}
          active={view === "settings" || view === "advanced"}
          onClick={() => setView("settings")}
        />
      </div>
    </div>
  );
}

function NavIcon({ icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-300 ${active ? "text-rose-500 scale-125" : "text-zinc-600"}`}
    >
      {icon}
    </button>
  );
}

function AdvancedSettings({ setView }: any) {
  const [config, setConfig] = useState({
    card: "a.movie-card",
    title: ".movie-title",
    img: "img",
    ep: ".episode",
    ajaxUrl: "https://kisskh.buzz/wp-admin/admin-ajax.php",
    bloggerUrl:
      "https://www.blogger.com/feeds/1422331367239821646/posts/default",
  });

  useEffect(() => {
    const saved = localStorage.getItem("suku_selectors");
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => setView("settings")}
        className="text-rose-500 text-sm mb-6 font-bold"
      >
        &larr; Back
      </button>
      <h2 className="text-xl font-bold mb-8">Scraper Config</h2>
      <div className="space-y-5">
        {Object.keys(config).map((key) => (
          <div key={key}>
            <label className="text-[10px] uppercase font-black text-rose-500/50 ml-2">
              {key}
            </label>
            <input
              value={(config as any)[key]}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              className="w-full bg-zinc-900 p-4 rounded-2xl mt-1 border border-white/5 text-sm outline-none focus:border-rose-500"
            />
          </div>
        ))}
        <button
          onClick={() => {
            localStorage.setItem("suku_selectors", JSON.stringify(config));
            alert("Saved! ✨");
            setView("home");
          }}
          className="w-full bg-rose-600 py-4 rounded-2xl font-black text-sm shadow-xl"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
