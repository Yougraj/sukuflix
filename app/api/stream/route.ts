export const runtime = "edge";

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const targetUrl = reqUrl.searchParams.get("url");
  const isSub = reqUrl.searchParams.get("isSub") === "true";

  if (!targetUrl) return new Response("No URL provided", { status: 400 });

  // 1. SMART REDIRECT FOR MP4s (Prevents Netlify from timing out on large movies)
  if (targetUrl.includes(".mp4") && !isSub) {
    return Response.redirect(targetUrl, 302);
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://kisskh.buzz/",
        Origin: "https://kisskh.buzz",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // 2. ERROR CATCHER
    if (!res.ok) {
      if (isSub)
        return new Response("WEBVTT\n\n", {
          headers: {
            "Content-Type": "text/vtt",
            "Access-Control-Allow-Origin": "*",
          },
        });
      return new Response("Server Blocked", { status: res.status });
    }

    let contentType = res.headers.get("content-type") || "";

    // 3. SUBTITLE FORMATTER & CONVERTER
    if (
      isSub ||
      contentType.includes("vtt") ||
      targetUrl.includes(".vtt") ||
      targetUrl.includes(".srt")
    ) {
      let text = await res.text();

      // Browsers STRICTLY require the file to start with WEBVTT.
      // If it's an SRT file, we convert it to VTT on the fly so it actually displays!
      if (!text.trim().startsWith("WEBVTT")) {
        text =
          "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
      }

      return new Response(text, {
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // 4. M3U8 PLAYLIST REWRITER
    if (contentType.includes("mpegurl") || targetUrl.includes(".m3u8")) {
      const text = await res.text();
      const baseApiUrl = `${reqUrl.origin}/api/stream?url=`;

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("#EXT-X-KEY")) {
            return trimmed.replace(/URI="(.*?)"/g, (match, url) => {
              const absUrl = url.startsWith("http")
                ? url
                : new URL(url, targetUrl).href;
              return `URI="${baseApiUrl}${encodeURIComponent(absUrl)}"`;
            });
          }
          if (trimmed.startsWith("#") || trimmed === "") return line;

          const absUrl = trimmed.startsWith("http")
            ? trimmed
            : new URL(trimmed, targetUrl).href;
          return `${baseApiUrl}${encodeURIComponent(absUrl)}`;
        })
        .join("\n");

      return new Response(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 5. STANDARD CHUNKS (.TS)
    return new Response(res.body, {
      headers: {
        "Content-Type": contentType || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response("Stream Error", { status: 500 });
  }
}
