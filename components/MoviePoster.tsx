"use client";

import Image from "next/image";
import { Clapperboard } from "lucide-react";
import type { Movie } from "@/lib/types";

type MoviePosterProps = {
  movie: Pick<Movie, "title" | "posterUrl">;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function MoviePoster({
  movie,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 45vw, 200px",
}: MoviePosterProps) {
  if (movie.posterUrl) {
    let optimized = false;
    try {
      const host = new URL(movie.posterUrl).hostname;
      optimized =
        host === "image.tmdb.org" || host.endsWith("ltrbxd.com") || host.endsWith("letterboxd.com");
    } catch {
      optimized = false;
    }

    return (
      <div className={`relative overflow-hidden rounded-lg bg-zinc-900 ${className}`}>
        <Image
          src={movie.posterUrl}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          unoptimized={!optimized}
        />
        <span className="sr-only">{movie.title} poster</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-600 ${className}`}
    >
      <Clapperboard className="h-1/4 w-1/4 min-h-8 min-w-8" strokeWidth={1.25} aria-hidden />
      <span className="sr-only">No poster for {movie.title}</span>
    </div>
  );
}
