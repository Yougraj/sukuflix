export const runtime = "edge";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const targetUrl = reqUrl.searchParams.get("url");
  const isSub = reqUrl.searchParams.get("isSub") === "true";

  if (!targetUrl) return new Response("No URL provided", { status: 400 });

  try {
    // 1. SETUP STEALTH HEADERS & FORWARD RANGE REQUESTS (CRITICAL FOR MP4s)
    const fetchHeaders: Record<string, string> = {
      Referer: "https://kisskh.buzz/",
      Origin: "https://kisskh.buzz",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    const range = req.headers.get("range");
    if (range) {
      fetchHeaders["Range"] = range; // Tells the server we only want a specific chunk of the video
    }

    const res = await fetch(targetUrl, { headers: fetchHeaders });

    // 2. ERROR CATCHER
    if (!res.ok && res.status !== 206) {
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

    // 3. SUBTITLE FORMATTER
    if (isSub || targetUrl.endsWith(".vtt") || targetUrl.endsWith(".srt")) {
      let text = await res.text();
      if (!text.trim().startsWith("WEBVTT")) {
        text =
          "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
      }
      return new Response(text, {
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
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

    // 5. STANDARD CHUNKS & MP4 BUFFERING
    const responseHeaders = new Headers({
      "Content-Type": contentType || "video/mp4",
      "Access-Control-Allow-Origin": "*",
    });

    // Pass through Range responses so the video player can seek and buffer
    if (res.headers.has("content-range")) {
      responseHeaders.set("Content-Range", res.headers.get("content-range")!);
      responseHeaders.set("Accept-Ranges", "bytes");
    }
    if (res.headers.has("content-length")) {
      responseHeaders.set("Content-Length", res.headers.get("content-length")!);
    }

    return new Response(res.body, {
      status: res.status, // 206 Partial Content or 200 OK
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response("Stream Error", { status: 500 });
  }
}
