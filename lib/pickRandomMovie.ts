import { movieStableId } from "./movieId";
import type { Movie } from "./types";

/**
 * Picks a random movie avoiding repeats until the pool is exhausted, then resets history.
 */
export function pickRandomMovie(
  movies: Movie[],
  previouslyPickedIds: Set<string>,
): { movie: Movie; nextPickedIds: Set<string> } {
  if (movies.length === 0) {
    throw new Error("movies array is empty");
  }

  const unpicked = movies.filter((m) => !previouslyPickedIds.has(movieStableId(m)));

  if (unpicked.length === 0) {
    const choice = movies[Math.floor(Math.random() * movies.length)]!;
    const next = new Set<string>([movieStableId(choice)]);
    return { movie: choice, nextPickedIds: next };
  }

  const choice = unpicked[Math.floor(Math.random() * unpicked.length)]!;
  const next = new Set(previouslyPickedIds);
  next.add(movieStableId(choice));
  return { movie: choice, nextPickedIds: next };
}
