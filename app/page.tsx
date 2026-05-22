"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LogOut, Play } from "lucide-react";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("suku_auth")) router.push("/login");
    const saved = JSON.parse(localStorage.getItem("suku_history") || "[]");
    setHistory(saved);
  }, [router]);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query) {
      setLoading(true);
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
    <div className="min-h-screen bg-[#141414] text-white">
      <nav className="p-6 flex justify-between items-center sticky top-0 bg-[#141414]/90 backdrop-blur-md z-50">
        <h1 className="text-rose-600 text-3xl font-black italic">SUKU FLIX</h1>
        <div className="flex gap-4 items-center">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500 group-focus-within:text-rose-500" />
            <input
              onKeyDown={handleSearch}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-black border border-zinc-700 rounded-full py-2 pl-10 pr-4 w-64 focus:w-80 transition-all outline-none"
              placeholder="Search your favorites..."
            />
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("suku_auth");
              router.push("/login");
            }}
          >
            <LogOut className="w-6 h-6 text-gray-400 hover:text-rose-500" />
          </button>
        </div>
      </nav>

      <main className="p-8">
        {/* History Section */}
        {history.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-rose-100">
              Continue Watching for Suku
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {history.map((item: any, i) => (
                <div
                  key={i}
                  onClick={() => openDrama(item)}
                  className="min-w-[280px] cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-xl h-40">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="fill-white w-12 h-12" />
                    </div>
                  </div>
                  <p className="mt-3 font-semibold truncate">{item.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-rose-500">
              Search Results
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {results.map((item: any, i) => (
                <div
                  key={i}
                  onClick={() => openDrama(item)}
                  className="cursor-pointer group"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute bottom-2 right-2 bg-rose-600 px-2 py-1 rounded text-xs">
                      {item.ep}
                    </div>
                  </div>
                  <p className="mt-3 font-bold text-sm truncate group-hover:text-rose-500 transition">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        {loading && (
          <p className="text-rose-500 animate-pulse text-center mt-20">
            Searching stories for you, love...
          </p>
        )}
      </main>
    </div>
  );
}
