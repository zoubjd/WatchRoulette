import { unstable_cache } from "next/cache";

export type OmdbEnrichment = {
  imdbRating?: string;
  rottenTomatoes?: string;
  metacritic?: string;
  imdbId?: string;
};

type OmdbRatingRow = { Source: string; Value: string };

type OmdbResponse = {
  Response?: string;
  Error?: string;
  imdbRating?: string;
  imdbID?: string;
  Ratings?: OmdbRatingRow[];
};

function omdbKey(): string {
  return process.env.OMDB_API_KEY?.trim() ?? "";
}

function pickRating(ratings: OmdbRatingRow[] | undefined, source: string): string | undefined {
  const row = ratings?.find((r) => r.Source === source);
  return row?.Value?.trim() || undefined;
}

async function enrichFromOmdbUncached(title: string, yearLabel: string): Promise<OmdbEnrichment> {
  const key = omdbKey();
  if (!key) return {};

  const y = yearLabel ? `&y=${encodeURIComponent(yearLabel)}` : "";
  const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&t=${encodeURIComponent(title)}${y}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {};
  const data = (await res.json()) as OmdbResponse;
  if (data.Response === "False" || data.Error) return {};

  return {
    imdbId: data.imdbID,
    imdbRating: data.imdbRating && data.imdbRating !== "N/A" ? data.imdbRating : undefined,
    rottenTomatoes: pickRating(data.Ratings, "Rotten Tomatoes"),
    metacritic: pickRating(data.Ratings, "Metacritic"),
  };
}

const cachedOmdb = unstable_cache(
  async (title: string, yearLabel: string) => enrichFromOmdbUncached(title, yearLabel),
  ["watchroulette-omdb"],
  { revalidate: 86_400 },
);

export async function fetchOmdbEnrichment(title: string, year?: number): Promise<OmdbEnrichment> {
  return cachedOmdb(title, year != null && Number.isFinite(year) ? String(year) : "");
}
