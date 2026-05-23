import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, query, title, selectors, genre } = body;

    // Default Selectors if none provided
    const s = selectors || {
      card: "a.movie-card",
      title: ".movie-title",
      img: "img",
      ep: ".episode",
      ajaxUrl: "https://kisskh.buzz/wp-admin/admin-ajax.php",
      bloggerUrl:
        "https://www.blogger.com/feeds/1422331367239821646/posts/default",
    };

    if (action === "search") {
      const formData = new URLSearchParams();
      formData.append("action", "fetch_live_movies");
      formData.append("keyword", query || "");
      formData.append("filter", genre || "all");
      formData.append("page", "1");

      const res = await fetch(s.ajaxUrl, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const html = await res.text();
      const $ = cheerio.load(html);
      const results: any[] = [];

      $(s.card).each((_, el) => {
        results.push({
          title: $(el).find(s.title).text().trim(),
          link: $(el).attr("href"),
          image: $(el).find(s.img).attr("src"),
          ep: $(el).find(s.ep).text().trim() || "Full",
        });
      });
      return NextResponse.json(results);
    }

    if (action === "episodes") {
      const res = await fetch(
        `${s.bloggerUrl}?q=${encodeURIComponent(title)}&alt=json&max-results=1`,
      );
      const data = await res.json();
      if (!data.feed.entry) return NextResponse.json([]);
      const content = data.feed.entry[0].content.$t;
      const eps = content
        .split(";")
        .map((part: string, i: number) => {
          if (!part.includes("|")) return null;
          const fields = part.split("|");
          return {
            label: `Episode ${i + 1}`,
            url: fields[0].trim(),
            sub: fields[2]?.split(",")[0].trim() || "",
          };
        })
        .filter(Boolean);
      return NextResponse.json(eps);
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Connection Error" }, { status: 500 });
  }
}
