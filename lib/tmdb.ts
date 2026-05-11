import { unstable_cache } from "next/cache";

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";

export type TmdbEnrichment = {
  posterUrl?: string;
  backdropUrl?: string;
  voteAverage?: number;
  genres?: string[];
  runtime?: number;
  overview?: string;
  trailerUrl?: string;
};

type TmdbSearchResult = {
  id: number;
  title: string;
  release_date?: string;
  vote_count?: number;
};

type TmdbSearchResponse = { results: TmdbSearchResult[] };

type TmdbGenre = { id: number; name: string };

type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official?: boolean;
};

type TmdbMovieDetailResponse = {
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genres: TmdbGenre[];
  runtime: number | null;
  overview: string;
  videos?: { results: TmdbVideo[] };
};

function tmdbKey(): string {
  return process.env.TMDB_API_KEY?.trim() ?? "";
}

function posterUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMG}/w780${path}`;
}

function backdropUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMG}/w1280${path}`;
}

function pickTrailer(videos: TmdbVideo[] | undefined): string | undefined {
  if (!videos?.length) return undefined;
  const yt = videos.filter((v) => v.site === "YouTube" && v.key);
  const trailer =
    yt.find((v) => v.type === "Trailer" && v.official) ||
    yt.find((v) => v.type === "Trailer") ||
    yt.find((v) => v.type === "Teaser") ||
    yt[0];
  if (!trailer?.key) return undefined;
  return `https://www.youtube.com/watch?v=${trailer.key}`;
}

async function tmdbFetchJson(path: string, key: string): Promise<unknown> {
  const url = `${TMDB_API}${path}${path.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function enrichFromTmdbUncached(title: string, yearLabel: string): Promise<TmdbEnrichment> {
  const key = tmdbKey();
  if (!key) return {};

  const year = yearLabel ? Number.parseInt(yearLabel, 10) : undefined;
  const q = encodeURIComponent(title);
  const yearParam =
    year != null && Number.isFinite(year) ? `&primary_release_year=${year}` : "";

  const search = (await tmdbFetchJson(
    `/search/movie?query=${q}${yearParam}`,
    key,
  )) as TmdbSearchResponse | null;
  
  const results = search?.results;
  if (!results?.length) return {};

  const pick =
    results.find((r) => {
      if (year == null || !Number.isFinite(year)) return true;
      const y = r.release_date ? Number.parseInt(r.release_date.slice(0, 4), 10) : NaN;
      return y === year;
    }) ?? results[0];

  const detail = (await tmdbFetchJson(
    `/movie/${pick.id}?append_to_response=videos`,
    key,
  )) as TmdbMovieDetailResponse | null;

  if (!detail) return {};

  const trailer = pickTrailer(detail.videos?.results);

  return {
    posterUrl: posterUrl(detail.poster_path),
    backdropUrl: backdropUrl(detail.backdrop_path),
    voteAverage:
      typeof detail.vote_average === "number" && detail.vote_average > 0
        ? detail.vote_average
        : undefined,
    genres: detail.genres?.map((g) => g.name).filter(Boolean),
    runtime: detail.runtime != null && detail.runtime > 0 ? detail.runtime : undefined,
    overview: detail.overview?.trim() || undefined,
    trailerUrl: trailer,
  };
}

export async function fetchTmdbEnrichment(
  title: string,
  year?: number,
): Promise<TmdbEnrichment> {
  return enrichFromTmdbUncached(
    title,
    year != null && Number.isFinite(year) ? String(year) : "",
  );
}
