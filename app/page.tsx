"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, Play, Home, Heart, User } from "lucide-react";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("suku_auth")) router.push("/login");
    const saved = JSON.parse(localStorage.getItem("suku_history") || "[]");
    setHistory(saved);
  }, [router]);

  const handleSearch = async (e: any) => {
    if ((e.key === "Enter" || e.type === "click") && query) {
      setLoading(true);
      setActiveTab("search");
      const res = await fetch("/api/scrape", {
        method: "POST",
        body: JSON.stringify({ action: "search", query }),
      });
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }
  };

  const openDrama = (item: any) => {
    const newHistory = [
      item,
      ...history.filter((h: any) => h.title !== item.title),
    ].slice(0, 20);
    localStorage.setItem("suku_history", JSON.stringify(newHistory));
    router.push(
      `/watch?title=${encodeURIComponent(item.title)}&img=${encodeURIComponent(item.image)}`,
    );
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Top Header - Frosted Glass */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 flex justify-between items-center backdrop-blur-sm">
        <h1 className="text-rose-600 text-2xl md:text-3xl font-black italic tracking-tighter">
          SUKU FLIX
        </h1>
        <button
          className="md:hidden p-2"
          onClick={() => {
            localStorage.removeItem("suku_auth");
            router.push("/login");
          }}
        >
          <LogOut className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              onKeyDown={handleSearch}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-zinc-900/80 border border-zinc-700 rounded-full py-2 pl-10 pr-4 w-64 focus:w-80 transition-all outline-none"
              placeholder="Search dramas..."
            />
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("suku_auth");
              router.push("/login");
            }}
            className="text-zinc-400 hover:text-rose-500"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-12">
        {/* History / Continue Watching */}
        {history.length > 0 && activeTab === "home" && (
          <section className="mb-8">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-zinc-200">
              Continue Watching for Suku
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x">
              {history.map((item: any, i) => (
                <div
                  key={i}
                  onClick={() => openDrama(item)}
                  className="min-w-[160px] md:min-w-[240px] snap-center cursor-pointer"
                >
                  <div className="relative aspect-video rounded-md overflow-hidden group">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-active:bg-black/40 transition"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                      <div className="bg-rose-600 h-full w-1/2"></div>
                    </div>
                    <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/80 fill-white" />
                  </div>
                  <p className="mt-2 text-xs md:text-sm font-medium truncate text-zinc-400">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mobile Search Input (Visible only on Mobile Search Tab) */}
        {activeTab === "search" && (
          <div className="md:hidden mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-zinc-500" />
              <input
                autoFocus
                onKeyDown={handleSearch}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a show..."
                className="w-full bg-zinc-800 py-3 pl-12 pr-4 rounded-lg outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>
          </div>
        )}

        {/* Results Grid */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-6 text-zinc-200">
            {activeTab === "search" ? `Results for "${query}"` : "Trending Now"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
              {(results.length > 0 ? results : []).map((item: any, i) => (
                <div
                  key={i}
                  onClick={() => openDrama(item)}
                  className="cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="relative aspect-[2/3] rounded-sm md:rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-0 right-0 bg-rose-600 px-1.5 py-0.5 m-1 rounded-sm text-[10px] font-bold">
                      {item.ep}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] md:text-sm font-medium truncate px-1">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-black/95 border-t border-zinc-800 px-8 py-3 flex justify-between items-center backdrop-blur-lg z-50">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 ${activeTab === "home" ? "text-white" : "text-zinc-500"}`}
        >
          <Home
            className={`w-6 h-6 ${activeTab === "home" ? "fill-white" : ""}`}
          />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center gap-1 ${activeTab === "search" ? "text-white" : "text-zinc-500"}`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold">Search</span>
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className="flex flex-col items-center gap-1 text-zinc-500"
        >
          <Heart className="w-6 h-6" />
          <span className="text-[10px] font-bold">New & Hot</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-zinc-500">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Suku</span>
        </button>
      </div>
    </div>
  );
}
