"use client";

import { motion } from "framer-motion";
import { Film, Star } from "lucide-react";
import type { Movie } from "@/lib/types";
import { MoviePoster } from "./MoviePoster";

type MovieCardProps = {
  movie: Movie;
  index: number;
};

export function MovieCard({ movie, index }: MovieCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.02, 0.4) }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-emerald-500/0 via-white/0 to-violet-500/0 opacity-0 blur-md transition duration-500 group-hover:from-emerald-500/20 group-hover:via-white/10 group-hover:to-violet-500/20 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-2 shadow-xl shadow-black/40 backdrop-blur-md transition-colors duration-300 group-hover:border-white/20">
        <MoviePoster
          movie={movie}
          className="aspect-[2/3] w-full"
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 180px"
        />
        <div className="mt-3 flex flex-1 flex-col gap-1.5 px-1 pb-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">
            {movie.title}
          </h3>
          <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-zinc-400">
            {movie.year != null ? (
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-300">{movie.year}</span>
            ) : null}
            {movie.tmdbRating != null ? (
              <span className="inline-flex items-center gap-0.5 rounded bg-sky-500/15 px-1.5 py-0.5 text-sky-200">
                <Star className="h-2.5 w-2.5 fill-sky-300/40 text-sky-200" aria-hidden />
                TMDB {movie.tmdbRating.toFixed(1)}
              </span>
            ) : null}
            {movie.imdbRating ? (
              <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-200">
                <Film className="h-2.5 w-2.5 opacity-80" aria-hidden />
                IMDb {movie.imdbRating}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
