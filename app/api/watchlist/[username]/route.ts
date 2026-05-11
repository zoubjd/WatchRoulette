import { NextResponse } from "next/server";
import { enrichMovies } from "@/lib/enrichMovies";
import { scrapeLetterboxdWatchlist } from "@/lib/scraper";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const { username: raw } = await context.params;
  const username = decodeURIComponent(raw ?? "").trim();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const scraped = await scrapeLetterboxdWatchlist(username);

  if (!scraped.ok) {
    if (scraped.code === "empty") {
      return NextResponse.json(
        { movies: [], error: scraped.message },
        { status: 200 },
      );
    }

    const status =
      scraped.code === "not_found"
        ? 404
        : scraped.code === "private"
          ? 403
          : scraped.code === "rate_limited"
            ? 429
            : scraped.code === "parse_error"
              ? 400
              : 502;

    return NextResponse.json(
      { error: scraped.message, code: scraped.code },
      { status },
    );
  }
  try {
    const movies = await enrichMovies(scraped.entries);
    if (movies.length === 0 && scraped.entries.length > 0) {
      return NextResponse.json(
        {
          movies: [],
          error:
            "No films could be matched to TMDB with posters. Check TMDB_API_KEY, or try again later.",
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ movies });
  } catch {
    return NextResponse.json(
      { error: "Failed to enrich watchlist with movie databases." },
      { status: 502 },
    );
  }
}
