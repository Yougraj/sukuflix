"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mic,
  Languages,
} from "lucide-react";
import Hls from "hls.js";

const Plyr = dynamic(() => import("plyr-react").then((m) => m.Plyr), {
  ssr: false,
});

function WatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTitle = searchParams.get("title") || "";

  const isDub = rawTitle.toLowerCase().includes("dub");
  const cleanTitle = rawTitle.replace(/\(?dub\)?/i, "").trim();

  const [episodes, setEpisodes] = useState<any[]>([]);
  const [activeEp, setActiveEp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const selectors = JSON.parse(
          localStorage.getItem("suku_selectors") || "null",
        );
        const res = await fetch("/api/discover", {
          method: "POST",
          body: JSON.stringify({
            action: "episodes",
            title: rawTitle,
            selectors,
          }),
        });
        const data = await res.json();
        setEpisodes(data);
        if (data.length > 0) setActiveEp(data[0]);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rawTitle]);

  useEffect(() => {
    if (!activeEp?.url) return;
    setError(false);

    const timer = setTimeout(() => {
      const video = document.querySelector("video");
      if (!video) return;

      // Ensure CORS so subtitles are allowed by the browser
      video.crossOrigin = "anonymous";
      const proxyUrl = `/api/stream?url=${encodeURIComponent(activeEp.url)}`;

      // --- AUTO-ROTATE & FULLSCREEN LOGIC ---
      const handlePlay = async () => {
        if (window.innerWidth < 768) {
          try {
            const plyrContainer = video.closest(".plyr");
            if (
              !document.fullscreenElement &&
              plyrContainer?.requestFullscreen
            ) {
              await plyrContainer.requestFullscreen();
            } else if ((video as any).webkitEnterFullscreen) {
              (video as any).webkitEnterFullscreen(); // iOS Fallback
            }
            if (screen.orientation && (screen.orientation as any).lock) {
              await (screen.orientation as any).lock("landscape"); // Lock to Landscape
            }
          } catch (e) {}
        }
      };

      const handleFullscreenExit = () => {
        if (!document.fullscreenElement && screen.orientation?.unlock) {
          screen.orientation.unlock(); // Unlock when she exits fullscreen
        }
      };

      video.addEventListener("play", handlePlay);
      document.addEventListener("fullscreenchange", handleFullscreenExit);

      // --- HLS LOGIC ---
      if (activeEp.url.includes(".m3u8")) {
        if (Hls.isSupported()) {
          const hls = new Hls({ debug: false });
          hls.loadSource(proxyUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else {
                hls.destroy();
                setError(true);
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = proxyUrl;
        }
      } else {
        video.src = proxyUrl;
      }

      return () => {
        video.removeEventListener("play", handlePlay);
        document.removeEventListener("fullscreenchange", handleFullscreenExit);
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [activeEp]);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-rose-600" size={40} />
        <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
          Preparing the story...
        </p>
      </div>
    );

  // Append isSub=true to guarantee it gets the VTT headers
  const subProxyUrl = activeEp?.sub
    ? `/api/stream?url=${encodeURIComponent(activeEp.sub)}&isSub=true`
    : "";
  const videoProxyUrl = `/api/stream?url=${encodeURIComponent(activeEp?.url || "")}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20">
      <div className="p-4 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-50">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-rose-500 active:scale-90 transition"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="flex-1 text-center px-2">
          <h1 className="text-xs font-bold truncate uppercase tracking-tighter">
            {cleanTitle}
          </h1>
          {/* DUB / SUB Indicators */}
          {isDub ? (
            <span className="text-[8px] font-black uppercase tracking-widest text-sky-400 bg-sky-900/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
              <Mic size={8} /> DUBBED
            </span>
          ) : (
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
              <Languages size={8} /> SUBBED
            </span>
          )}
        </div>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto px-2 mt-2">
        <div className="rounded-xl overflow-hidden shadow-2xl bg-black aspect-video border border-white/5 relative">
          {error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center gap-4">
              <AlertCircle className="text-rose-600 animate-bounce" size={40} />
              <p className="text-sm font-bold text-rose-100">
                Video Server Locked
              </p>
              <a
                href={activeEp?.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-rose-600 px-6 py-3 rounded-full font-black text-xs shadow-lg mt-2 active:scale-95 transition"
              >
                <ExternalLink size={16} /> Open Native Player
              </a>
            </div>
          )}

          {/* Key ensures Plyr completely restarts on new episode to load correct subtitles */}
          <Plyr
            key={activeEp?.label}
            source={{
              type: "video",
              sources: [{ src: videoProxyUrl, type: "video/mp4" }],
              tracks: subProxyUrl
                ? [
                    {
                      kind: "captions",
                      label: "English",
                      srcLang: "en",
                      src: subProxyUrl,
                      default: true,
                    },
                  ]
                : [],
            }}
            options={{
              captions: { active: true, update: true, language: "en" },
              fullscreen: { enabled: true, fallback: true, iosNative: true },
            }}
          />
        </div>

        <div className="mt-8 px-2">
          <div className="flex items-center mb-6">
            <div className="h-px flex-1 bg-zinc-800"></div>
            <h3 className="mx-4 text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-black">
              Episodes List
            </h3>
            <div className="h-px flex-1 bg-zinc-800"></div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {episodes.map((ep: any, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveEp(ep);
                  setError(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-4 rounded-xl font-black transition-all active:scale-90 text-sm border ${
                  activeEp?.label === ep.label
                    ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                    : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-800"
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

export default function Watch() {
  return (
    <Suspense>
      <WatchContent />
    </Suspense>
  );
}
