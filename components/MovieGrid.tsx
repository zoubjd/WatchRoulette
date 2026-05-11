"use client";

import type { Movie } from "@/lib/types";
import { movieStableId } from "@/lib/movieId";
import { MovieCard } from "./MovieCard";

type MovieGridProps = {
  movies: Movie[];
};

export function MovieGrid({ movies }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-3 min-[400px]:gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie, index) => (
        <MovieCard key={movieStableId(movie)} movie={movie} index={index} />
      ))}
    </div>
  );
}
