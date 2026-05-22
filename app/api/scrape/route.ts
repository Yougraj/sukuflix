import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BLOGGER_FEED_URL =
  "https://www.blogger.com/feeds/1422331367239821646/posts/default";
const AJAX_URL = "https://kisskh.buzz/wp-admin/admin-ajax.php";

export async function POST(req: Request) {
  const { action, query, title } = await req.json();

  // Search Logic
  if (action === "search") {
    const formData = new URLSearchParams();
    formData.append("action", "fetch_live_movies");
    formData.append("keyword", query);
    formData.append("filter", "all");
    formData.append("page", "1");

    const res = await fetch(AJAX_URL, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: any[] = [];

    $("a.movie-card").each((_, el) => {
      results.push({
        title: $(el).find(".movie-title").text().trim(),
        link: $(el).attr("href"),
        image: $(el).find("img").attr("src"),
        ep: $(el).find(".episode").text().trim() || "Movie",
      });
    });
    return NextResponse.json(results);
  }

  // Episodes Logic
  if (action === "episodes") {
    const res = await fetch(
      `${BLOGGER_FEED_URL}?q=${encodeURIComponent(title)}&alt=json&max-results=1`,
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
          label: `EP ${i + 1}`,
          url: fields[0].trim(),
          sub: fields[2]?.split(",")[0].trim() || "",
        };
      })
      .filter(Boolean);

    return NextResponse.json(eps);
  }
}
