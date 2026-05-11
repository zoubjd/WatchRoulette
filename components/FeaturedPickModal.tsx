"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, ExternalLink, Play, Sparkles, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { movieStableId } from "@/lib/movieId";
import type { Movie } from "@/lib/types";

export type PickPhase = "closed" | "spinning" | "revealed";

type FeaturedPickModalProps = {
  phase: PickPhase;
  flickerPosterUrl: string | null;
  movie: Movie | null;
  onClose: () => void;
  onPickAnother: () => void;
};

function formatRuntime(min?: number): string | null {
  if (min == null || !Number.isFinite(min) || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function FeaturedPickModal({
  phase,
  flickerPosterUrl,
  movie,
  onClose,
  onPickAnother,
}: FeaturedPickModalProps) {
  const open = phase !== "closed";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const backdropSrc = movie?.backdropUrl ?? movie?.posterUrl ?? null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-stretch justify-center sm:items-center sm:p-4 sm:pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <AnimatePresence mode="wait">
            {phase === "spinning" ? (
              <motion.div
                key="spin"
                role="status"
                aria-live="polite"
                className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(12px)" }}
                transition={{ duration: 0.35 }}
              >
                <motion.div
                  className="relative aspect-[2/3] w-52 overflow-hidden rounded-2xl shadow-[0_0_60px_-10px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/30 sm:w-60"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
                >
                  {flickerPosterUrl ? (
                    <Image
                      src={flickerPosterUrl}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover"
                      unoptimized={!flickerPosterUrl.includes("image.tmdb.org")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                      <Sparkles className="h-12 w-12 animate-pulse" aria-hidden />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/5" />
                </motion.div>
                <p className="mt-10 text-center text-xs font-semibold uppercase tracking-[0.45em] text-zinc-500">
                  Rolling the queue
                </p>
                <p className="mt-3 text-center text-sm text-zinc-400">Finding your next screening…</p>
              </motion.div>
            ) : phase === "revealed" && movie ? (
              <motion.div
                key={movieStableId(movie)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="pick-title"
                className="relative z-10 my-auto flex max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-none border border-white/10 border-b-0 bg-zinc-950/95 shadow-2xl shadow-black/80 backdrop-blur-xl sm:max-h-[min(92vh,920px)] sm:rounded-3xl sm:border-b"
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                {backdropSrc ? (
                  <div className="pointer-events-none absolute inset-0">
                    <Image
                      src={backdropSrc}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover opacity-35 blur-2xl saturate-150"
                      unoptimized={!backdropSrc.includes("image.tmdb.org")}
                    />
                  </div>
                ) : (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-violet-950/50" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/40" />

                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-20 rounded-full border border-white/10 bg-black/50 p-2 text-zinc-300 transition hover:bg-black/70 hover:text-white sm:right-5 sm:top-5"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>

                <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:grid sm:grid-cols-[220px_1fr] sm:gap-10 sm:p-10 sm:pb-10">
                  <motion.div
                    className="mx-auto w-full max-w-[200px] shrink-0 sm:mx-0 sm:max-w-none"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05, duration: 0.45 }}
                  >
                    <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/70 ring-1 ring-white/15">
                      <div className="relative aspect-[2/3] w-full bg-zinc-900">
                        {movie.posterUrl ? (
                          <Image
                            src={movie.posterUrl}
                            alt=""
                            fill
                            priority
                            sizes="220px"
                            className="object-cover"
                            unoptimized={!movie.posterUrl.includes("image.tmdb.org")}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-600">
                            <Sparkles className="h-10 w-10" aria-hidden />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex min-h-0 flex-col gap-5 pb-1">
                    <div>
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400/90"
                      >
                        Tonight&apos;s feature
                      </motion.p>
                      <motion.h2
                        id="pick-title"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 }}
                        className="mt-2 text-balance text-[clamp(1.5rem,6vw,2.75rem)] font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
                      >
                        {movie.title}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 }}
                        className="mt-4 flex flex-wrap gap-2"
                      >
                        {movie.year != null ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-zinc-200">
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                            {movie.year}
                          </span>
                        ) : null}
                        {formatRuntime(movie.runtime) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-zinc-200">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                            {formatRuntime(movie.runtime)}
                          </span>
                        ) : null}
                        {movie.genres?.slice(0, 5).map((g) => (
                          <span
                            key={g}
                            className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100/90"
                          >
                            {g}
                          </span>
                        ))}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
                      >
                        {movie.tmdbRating != null ? (
                          <div className="rounded-xl border border-sky-500/25 bg-sky-950/40 px-3 py-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/80">
                              TMDB
                            </p>
                            <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-white">
                              <Star className="h-4 w-4 fill-sky-400/50 text-sky-200" aria-hidden />
                              {movie.tmdbRating.toFixed(1)}
                            </p>
                          </div>
                        ) : null}
                        {movie.imdbRating ? (
                          <div className="rounded-xl border border-amber-500/25 bg-amber-950/35 px-3 py-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
                              IMDb
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">{movie.imdbRating}</p>
                          </div>
                        ) : null}
                        {movie.rottenTomatoes ? (
                          <div className="rounded-xl border border-lime-500/25 bg-lime-950/30 px-3 py-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-lime-300/80">
                              Tomatometer
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">{movie.rottenTomatoes}</p>
                          </div>
                        ) : null}
                        {movie.metacritic ? (
                          <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-950/30 px-3 py-3 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300/80">
                              Metacritic
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">{movie.metacritic}</p>
                          </div>
                        ) : null}
                      </motion.div>

                      {movie.overview ? (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-4 line-clamp-5 text-sm leading-relaxed text-zinc-400 sm:line-clamp-6"
                        >
                          {movie.overview}
                        </motion.p>
                      ) : null}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 }}
                      className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                    >
                      <button
                        type="button"
                        onClick={onPickAnother}
                        className="inline-flex h-12 min-w-[160px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500"
                      >
                        Pick Another
                      </button>
                      {movie.trailerUrl ? (
                        <a
                          href={movie.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-12 min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-zinc-100 transition hover:border-white/25 hover:bg-white/10"
                        >
                          <Play className="h-4 w-4 fill-current" aria-hidden />
                          Trailer
                        </a>
                      ) : null}
                      <a
                        href={movie.letterboxdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-zinc-200 transition hover:border-emerald-500/30 hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                        Letterboxd
                      </a>
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-12 min-w-[120px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-black/30 text-sm font-semibold text-zinc-300 transition hover:border-white/25 hover:bg-black/50"
                      >
                        Close
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
