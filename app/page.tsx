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
  Heart,
  Sparkles,
  User,
  Cpu,
  X,
  ChevronRight,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileDashboard() {
  const [view, setView] = useState<
    "home" | "search" | "history" | "settings" | "advanced" | "genre"
  >("home");
  const [showIntro, setShowIntro] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("suku_history") || "[]",
    );
    setHistory(savedHistory);
    fetchContent("all");
    const timer = setTimeout(() => setShowIntro(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  const fetchContent = async (genre = "all", q = "") => {
    setLoading(true);
    try {
      const selectors = JSON.parse(
        localStorage.getItem("suku_selectors") || "null",
      );
      const res = await fetch("/api/scrape", {
        method: "POST",
        body: JSON.stringify({
          action: "search",
          query: q,
          genre: genre,
          selectors: selectors,
        }),
      });
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const openDrama = (item: any) => {
    const newHistory = [
      item,
      ...history.filter((h: any) => h.title !== item.title),
    ].slice(0, 20);
    localStorage.setItem("suku_history", JSON.stringify(newHistory));
    setHistory(newHistory);
    router.push(`/watch?title=${encodeURIComponent(item.title)}`);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white select-none overflow-x-hidden font-sans">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative"
            >
              <Heart
                fill="#e11d48"
                className="text-rose-600 w-20 h-20 drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-2xl font-black tracking-[0.2em] italic text-rose-100"
            >
              WELCOME HOME, SUKU ❤️
            </motion.h1>
            <p className="mt-2 text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
              Everything is ready
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 py-5 flex justify-between items-center sticky top-0 bg-[#141414]/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="text-rose-500 w-4 h-4 animate-pulse" />
          <h1 className="text-2xl font-black italic tracking-tighter text-rose-600">
            SUKU FLIX
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {view === "search" && (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 160, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                autoFocus
                className="bg-zinc-900 rounded-full px-4 py-2 text-xs outline-none ring-1 ring-rose-500/30 placeholder:text-zinc-600"
                placeholder="Find a story..."
                onChange={(e) => {
                  setQuery(e.target.value);
                  fetchContent("all", e.target.value);
                }}
              />
            )}
          </AnimatePresence>
          <button
            className="p-2 active:scale-90 transition-transform"
            onClick={() => setView(view === "search" ? "home" : "search")}
          >
            {view === "search" ? (
              <X className="text-zinc-400" />
            ) : (
              <Search size={24} className="text-zinc-400" />
            )}
          </button>
        </div>
      </header>

      <main className="px-4 pt-4 pb-32 max-w-6xl mx-auto">
        {view === "home" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {history.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                    Continue Watching
                  </h2>
                  <button
                    onClick={() => setView("history")}
                    className="text-rose-500 text-[10px] font-bold"
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-2">
                  {history.map((item: any, i) => (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDrama(item)}
                      className="min-w-[180px] md:min-w-[260px] snap-start cursor-pointer group"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 relative border border-white/5 shadow-xl">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play
                            fill="white"
                            size={32}
                            className="text-white drop-shadow-lg"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                          <div className="bg-rose-600 h-full w-[60%]"></div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-bold truncate px-1 text-zinc-300">
                        {item.title.replace(/\(?dub\)?/i, "")}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-5 px-1">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  Recently Added
                </h2>
                {loading && (
                  <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {results.map((item: any, i) => {
                  const isDub = item.title.toLowerCase().includes("dub");
                  return (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => openDrama(item)}
                      className="cursor-pointer group"
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                          loading="lazy"
                        />

                        {/* Sub/Dub Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isDub && (
                            <span className="bg-sky-600/90 backdrop-blur-md text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                              <Mic size={8} /> DUB
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 bg-rose-600/90 backdrop-blur-md text-[10px] font-black px-2 py-0.5 rounded shadow-lg">
                          {item.ep}
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] font-bold truncate px-1 text-zinc-400 group-hover:text-rose-500 transition-colors">
                        {item.title.replace(/\(?dub\)?/i, "")}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </motion.div>
        )}

        {/* Other views remain exactly the same as previously formatted... */}
        {view === "search" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">
              Search Results for "{query || "..."}"
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {results.map((item: any, i) => {
                const isDub = item.title.toLowerCase().includes("dub");
                return (
                  <div
                    key={i}
                    onClick={() => openDrama(item)}
                    className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative"
                  >
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                    />
                    {isDub && (
                      <span className="absolute top-2 left-2 bg-sky-600/90 backdrop-blur-md text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg">
                        DUB
                      </span>
                    )}
                    <div className="absolute top-2 right-2 bg-rose-600/90 backdrop-blur-md text-[10px] font-black px-2 py-0.5 rounded shadow-lg">
                      {item.ep}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === "history" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <h2 className="text-xl font-bold mb-8 text-rose-500">
              Your Watch History
            </h2>
            {history.map((item: any, i) => (
              <div
                key={i}
                onClick={() => openDrama(item)}
                className="bg-zinc-900/50 p-3 rounded-2xl flex gap-4 items-center border border-white/5 active:bg-zinc-800"
              >
                <img
                  src={item.image}
                  className="w-20 aspect-video object-cover rounded-lg"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm truncate">
                    {item.title.replace(/\(?dub\)?/i, "")}
                  </p>
                  <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">
                    Resume Story
                  </p>
                </div>
                <ChevronRight className="text-zinc-700" size={18} />
              </div>
            ))}
          </motion.div>
        )}

        {view === "settings" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto pt-10 text-center"
          >
            <div className="relative inline-block">
              <div className="w-28 h-24 bg-rose-600 rounded-full mx-auto flex items-center justify-center text-5xl italic font-black shadow-[0_0_30px_rgba(225,29,72,0.4)] border-4 border-white/10">
                S
              </div>
              <div className="absolute -bottom-2 -right-2 bg-zinc-900 p-2 rounded-full border border-white/10">
                <Heart size={16} fill="#e11d48" className="text-rose-500" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-black italic">Sudarshona</h2>
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              Sweetheart Access
            </p>
            <div className="mt-12 space-y-3">
              <button
                onClick={() => setView("advanced")}
                className="w-full bg-zinc-900/50 p-5 rounded-2xl flex justify-between items-center text-sm font-bold border border-white/5 active:bg-zinc-800"
              >
                <span>Scraper Engine Config</span>
                <Cpu size={20} className="text-rose-500" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full bg-rose-900/10 text-rose-500 p-5 rounded-2xl text-sm font-black uppercase tracking-widest active:bg-rose-900/20"
              >
                Reset Everything
              </button>
            </div>
          </motion.div>
        )}

        {view === "advanced" && <AdvancedSettings setView={setView} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-8 py-5 flex justify-between items-center z-[60] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <NavIcon
          icon={<Home size={26} />}
          active={view === "home"}
          onClick={() => setView("home")}
        />
        <NavIcon
          icon={<LayoutGrid size={26} />}
          active={view === "search"}
          onClick={() => setView("search")}
        />
        <NavIcon
          icon={<History size={26} />}
          active={view === "history"}
          onClick={() => setView("history")}
        />
        <NavIcon
          icon={<User size={26} />}
          active={view === "settings" || view === "advanced"}
          onClick={() => setView("settings")}
        />
      </nav>
    </div>
  );
}

function NavIcon({ icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative transition-all duration-500 ${active ? "text-rose-500 scale-110" : "text-zinc-600 hover:text-zinc-400"}`}
    >
      {icon}
      {active && (
        <motion.div
          layoutId="nav-dot"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"
        />
      )}
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
  const save = () => {
    localStorage.setItem("suku_selectors", JSON.stringify(config));
    alert("Saved!");
    setView("settings");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-xl mx-auto pb-10"
    >
      <button
        onClick={() => setView("settings")}
        className="text-rose-500 text-xs font-black uppercase tracking-widest mb-6 block"
      >
        ← Back
      </button>
      <h2 className="text-xl font-black mb-2 italic">Engine Configuration</h2>
      <div className="space-y-6">
        {Object.keys(config).map((key) => (
          <div key={key} className="space-y-1.5">
            <label className="text-[9px] uppercase font-black text-rose-500/60 ml-2 tracking-widest">
              {key}
            </label>
            <input
              value={(config as any)[key]}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-xs font-mono outline-none focus:border-rose-500"
            />
          </div>
        ))}
        <button
          onClick={save}
          className="w-full bg-rose-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em]"
        >
          Save Engine
        </button>
      </div>
    </motion.div>
  );
}
