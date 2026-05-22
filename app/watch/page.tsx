"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic"; // Import dynamic for SSR handling
import { ChevronLeft, Loader2 } from "lucide-react";

// Load Plyr dynamically to prevent "window is not defined" or "Export default" errors
const Plyr = dynamic(() => import("plyr-react").then((mod) => mod.Plyr), {
  ssr: false, // Disable server-side rendering for this component
});

function WatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get("title");
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [activeEp, setActiveEp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) return;

    const loadEpisodes = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "episodes", title }),
        });
        const data = await res.json();
        setEpisodes(data);
        if (data.length > 0) setActiveEp(data[0]);
      } catch (error) {
        console.error("Failed to load episodes", error);
      } finally {
        setLoading(false);
      }
    };

    loadEpisodes();
  }, [title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium font-serif">
          Getting the popcorn ready...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-rose-500 hover:text-rose-400 transition font-bold"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </button>
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-black text-rose-100 truncate max-w-[200px] md:max-w-md">
            {title}
          </h1>
          {activeEp && (
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              Now Playing: {activeEp.label}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Player Section */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-900 bg-black aspect-video relative">
          {activeEp ? (
            <Plyr
              source={{
                type: "video",
                title: activeEp.label,
                sources: [{ src: activeEp.url, type: "video/mp4" }],
                tracks: [
                  {
                    kind: "captions",
                    label: "English",
                    srcLang: "en",
                    src: activeEp.sub,
                    default: true,
                  },
                ],
              }}
              options={{
                captions: { active: true, update: true },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-700">
              No video source found.
            </div>
          )}
        </div>

        {/* Episode List Section */}
        <div className="mt-12 mb-20">
          <div className="flex items-center mb-6">
            <div className="h-px flex-1 bg-zinc-800"></div>
            <h3 className="mx-4 text-zinc-500 uppercase tracking-[0.3em] text-xs font-black">
              Episodes List
            </h3>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {episodes.map((ep: any, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveEp(ep);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-4 rounded-2xl font-black transition-all transform active:scale-95 ${
                  activeEp?.label === ep.label
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40 ring-2 ring-rose-400"
                    : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
