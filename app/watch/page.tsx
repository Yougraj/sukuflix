"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, Loader2 } from "lucide-react";

const Plyr = dynamic(() => import("plyr-react").then((m) => m.Plyr), {
  ssr: false,
});

function WatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const title = searchParams.get("title");
  const [episodes, setEpisodes] = useState([]);
  const [activeEp, setActiveEp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const selectors = JSON.parse(
        localStorage.getItem("suku_selectors") || "null",
      );
      const res = await fetch("/api/scrape", {
        method: "POST",
        body: JSON.stringify({ action: "episodes", title, selectors }),
      });
      const data = await res.json();
      setEpisodes(data);
      if (data.length > 0) setActiveEp(data[0]);
      setLoading(false);
    };
    load();
  }, [title]);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-rose-600" size={40} />
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
          Loading Stories...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-lg z-50">
        <button
          onClick={() => router.back()}
          className="text-rose-500 font-bold flex items-center"
        >
          <ChevronLeft /> Back
        </button>
        <h1 className="text-sm font-bold truncate max-w-[200px]">{title}</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/5 aspect-video">
          {activeEp && (
            <Plyr
              source={{
                type: "video",
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
              options={{ captions: { active: true, update: true } }}
            />
          )}
        </div>

        <div className="mt-10">
          <h3 className="text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-black mb-6">
            Select Episode
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {episodes.map((ep: any, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveEp(ep);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-4 rounded-xl font-black transition text-sm ${activeEp?.label === ep.label ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40" : "bg-zinc-900 text-zinc-500"}`}
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

export default function Watch() {
  return (
    <Suspense>
      <WatchContent />
    </Suspense>
  );
}
