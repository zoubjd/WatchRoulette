import pLimit from "p-limit";
import type { Movie } from "./types";
import { fetchOmdbEnrichment } from "./omdb";
import { fetchTmdbEnrichment } from "./tmdb";
import type { WatchlistScrapeEntry } from "./scraper";

const CONCURRENCY = 6;

function mergeEntry(
  entry: WatchlistScrapeEntry,
  tmdb: Awaited<ReturnType<typeof fetchTmdbEnrichment>>,
  omdb: Awaited<ReturnType<typeof fetchOmdbEnrichment>>,
): Movie {
  return {
    title: entry.title,
    year: entry.year,
    letterboxdUrl: entry.letterboxdUrl,
    posterUrl: tmdb.posterUrl,
    backdropUrl: tmdb.backdropUrl,
    tmdbRating: tmdb.voteAverage,
    genres: tmdb.genres,
    runtime: tmdb.runtime,
    overview: tmdb.overview,
    trailerUrl: tmdb.trailerUrl,
    imdbRating: omdb.imdbRating,
    rottenTomatoes: omdb.rottenTomatoes,
    metacritic: omdb.metacritic,
  };
}

async function enrichOne(entry: WatchlistScrapeEntry): Promise<Movie | null> {
  const [tmdb, omdb] = await Promise.all([
    fetchTmdbEnrichment(entry.title, entry.year),
    fetchOmdbEnrichment(entry.title, entry.year),
  ]);
  const movie = mergeEntry(entry, tmdb, omdb);
  if (!movie.posterUrl?.trim()) return null;
  return movie;
}

/**
 * Hydrates every scraped row via TMDB + OMDb with bounded concurrency.
 * Drops rows without a TMDB poster so the client never receives list-only stubs.
 */
export async function enrichMovies(entries: WatchlistScrapeEntry[]): Promise<Movie[]> {
  if (entries.length === 0) return [];
  const limit = pLimit(CONCURRENCY);
  const results = await Promise.all(entries.map((entry) => limit(() => enrichOne(entry))));
  return results.filter((m): m is Movie => m != null);
}
