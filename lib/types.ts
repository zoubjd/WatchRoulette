/**
 * Fully enriched title (Letterboxd list + TMDB + OMDb). Only titles with a TMDB
 * poster are returned from the API.
 */
export type Movie = {
  title: string;
  year?: number;
  letterboxdUrl: string;

  posterUrl?: string;
  backdropUrl?: string;

  tmdbRating?: number;
  imdbRating?: string;
  rottenTomatoes?: string;
  metacritic?: string;

  genres?: string[];
  runtime?: number;
  overview?: string;
  trailerUrl?: string;
};

export type WatchlistFetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; movies: Movie[] }
  | { status: "error"; message: string }
  | { status: "empty" };
