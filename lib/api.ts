import type { Movie } from "./types";

export type FetchWatchlistResult =
  | { ok: true; movies: Movie[] }
  | { ok: false; error: "network" | "not_found" | "invalid" | "empty" | "server" | "private" | "rate_limited"; message: string };

export async function fetchWatchlist(username: string): Promise<FetchWatchlistResult> {
  const trimmed = username.trim();
  if (!trimmed) {
    return { ok: false, error: "invalid", message: "Enter a Letterboxd username, watchlist, or list URL." };
  }

  const path = `/api/watchlist/${encodeURIComponent(trimmed)}`;

  let res: Response;
  try {
    res = await fetch(path, { method: "GET", cache: "no-store" });
  } catch {
    return {
      ok: false,
      error: "network",
      message: "Could not reach the server. Check your connection and try again.",
    };
  }

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    return {
      ok: false,
      error: "server",
      message: "Received an unexpected response. Please try again later.",
    };
  }

  if (res.status === 404) {
    return {
      ok: false,
      error: "not_found",
      message: isRecord(body) && typeof body.error === "string" ? body.error : "That member was not found.",
    };
  }

  if (res.status === 403) {
    return {
      ok: false,
      error: "private",
      message:
        isRecord(body) && typeof body.error === "string"
          ? body.error
          : "This list is private or unavailable.",
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      error: "rate_limited",
      message:
        isRecord(body) && typeof body.error === "string"
          ? body.error
          : "Too many requests. Wait a moment and try again.",
    };
  }

  if (res.status === 400) {
    return {
      ok: false,
      error: "invalid",
      message: isRecord(body) && typeof body.error === "string" ? body.error : "Invalid username.",
    };
  }

  if (!res.ok) {
    const msg =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : "Could not load the list. Try again in a moment.";
    return { ok: false, error: "server", message: msg };
  }

  const movies = parseMoviesResponse(body);
  if (movies.length === 0) {
    const hint =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : "This list is empty — try a different watchlist or curated list.";
    return {
      ok: false,
      error: "empty",
      message: hint,
    };
  }

  return { ok: true, movies };
}

function parseMoviesResponse(body: unknown): Movie[] {
  if (!isRecord(body) || !Array.isArray(body.movies)) return [];
  const out: Movie[] = [];
  for (const row of body.movies) {
    if (!isRecord(row)) continue;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const letterboxdUrl =
      typeof row.letterboxdUrl === "string" && row.letterboxdUrl.trim()
        ? row.letterboxdUrl.trim()
        : "";
    if (!title || !letterboxdUrl) continue;

    const movie: Movie = { title, letterboxdUrl };

    let year: number | undefined;
    if (typeof row.year === "number" && Number.isFinite(row.year)) year = row.year;
    else if (typeof row.year === "string") {
      const y = Number.parseInt(row.year, 10);
      if (Number.isFinite(y)) year = y;
    }
    if (year != null) movie.year = year;

    if (typeof row.posterUrl === "string" && row.posterUrl.trim()) movie.posterUrl = row.posterUrl.trim();
    if (typeof row.backdropUrl === "string" && row.backdropUrl.trim())
      movie.backdropUrl = row.backdropUrl.trim();
    if (typeof row.tmdbRating === "number" && Number.isFinite(row.tmdbRating))
      movie.tmdbRating = row.tmdbRating;
    if (typeof row.imdbRating === "string" && row.imdbRating.trim()) movie.imdbRating = row.imdbRating.trim();
    if (typeof row.rottenTomatoes === "string" && row.rottenTomatoes.trim())
      movie.rottenTomatoes = row.rottenTomatoes.trim();
    if (typeof row.metacritic === "string" && row.metacritic.trim())
      movie.metacritic = row.metacritic.trim();
    if (Array.isArray(row.genres) && row.genres.every((g) => typeof g === "string"))
      movie.genres = row.genres as string[];
    if (typeof row.runtime === "number" && Number.isFinite(row.runtime)) movie.runtime = row.runtime;
    if (typeof row.overview === "string" && row.overview.trim()) movie.overview = row.overview.trim();
    if (typeof row.trailerUrl === "string" && row.trailerUrl.trim()) movie.trailerUrl = row.trailerUrl.trim();

    if (!movie.posterUrl) continue;

    out.push(movie);
  }
  return out;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
