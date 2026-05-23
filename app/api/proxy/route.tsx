export const runtime = "edge";

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const targetUrl = reqUrl.searchParams.get("url");

  if (!targetUrl) return new Response("No URL provided", { status: 400 });

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://kisskh.buzz/",
        Origin: "https://kisskh.buzz",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const contentType = res.headers.get("content-type") || "";

    // Subtitle Fix
    if (targetUrl.includes(".vtt") || targetUrl.includes(".srt")) {
      const text = await res.text();
      return new Response(text, {
        headers: {
          "Content-Type": "text/vtt",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Video Playlist Proxy Fix (Netlify reliable origin)
    if (contentType.includes("mpegurl") || targetUrl.includes(".m3u8")) {
      const text = await res.text();
      const baseApiUrl = `${reqUrl.origin}/api/proxy?url=`;

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("#EXT-X-KEY")) {
            return trimmed.replace(/URI="(.*?)"/g, (match, url) => {
              const absUrl = url.startsWith("http")
                ? url
                : new URL(url, res.url).href;
              return `URI="${baseApiUrl}${encodeURIComponent(absUrl)}"`;
            });
          }
          if (trimmed.startsWith("#") || trimmed === "") return line;

          const absUrl = trimmed.startsWith("http")
            ? trimmed
            : new URL(trimmed, res.url).href;
          return `${baseApiUrl}${encodeURIComponent(absUrl)}`;
        })
        .join("\n");

      return new Response(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      });
    }

    // Stream Video Chunks
    return new Response(res.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response("Proxy Error", { status: 500 });
  }
}
