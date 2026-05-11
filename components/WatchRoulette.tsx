"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWatchlist } from "@/lib/api";
import { pickRandomMovie } from "@/lib/pickRandomMovie";
import type { Movie, WatchlistFetchState } from "@/lib/types";
import { AnimatedBackground } from "./AnimatedBackground";
import { CinematicLoadingScreen } from "./CinematicLoadingScreen";
import { EmptyWatchlist } from "./EmptyWatchlist";
import { FeaturedPickModal, type PickPhase } from "./FeaturedPickModal";
import { FilmGrainOverlay } from "./FilmGrainOverlay";
import { LandingHero } from "./LandingHero";
import { MovieGrid } from "./MovieGrid";
import { PickRandomBar } from "./PickRandomBar";
import { StatusMessage } from "./StatusMessage";

function typingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

type WatchRouletteProps = {
  displayFontClass: string;
};

const SPIN_MS = 1080;
const FLICKER_MS = 72;

export function WatchRoulette({ displayFontClass }: WatchRouletteProps) {
  const [username, setUsername] = useState("");
  const [fetchState, setFetchState] = useState<WatchlistFetchState>({ status: "idle" });
  const [pickPhase, setPickPhase] = useState<PickPhase>("closed");
  const [flickerPosterUrl, setFlickerPosterUrl] = useState<string | null>(null);
  const [picked, setPicked] = useState<Movie | null>(null);
  const [pickedIds, setPickedIds] = useState<Set<string>>(() => new Set());
  const resultsRef = useRef<HTMLDivElement>(null);
  const pickLockRef = useRef(false);
  const spinIntervalRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const [uiPicking, setUiPicking] = useState(false);

  const movies = fetchState.status === "success" ? fetchState.movies : [];
  const loading = fetchState.status === "loading";

  const closePick = useCallback(() => {
    cancelledRef.current = true;
    if (spinIntervalRef.current != null) {
      window.clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
    pickLockRef.current = false;
    setUiPicking(false);
    setPickPhase("closed");
    setPicked(null);
    setFlickerPosterUrl(null);
  }, []);

  const runPick = useCallback(async () => {
    if (pickLockRef.current) return;
    if (fetchState.status !== "success") return;
    const list = fetchState.movies;
    if (list.length === 0) return;

    pickLockRef.current = true;
    setUiPicking(true);
    cancelledRef.current = false;

    const poolWithPoster = list.filter((m) => m.posterUrl);
    const pool = poolWithPoster.length > 0 ? poolWithPoster : list;

    setPickPhase("spinning");
    setPicked(null);
    setFlickerPosterUrl(pool[0]?.posterUrl ?? null);

    spinIntervalRef.current = window.setInterval(() => {
      const m = pool[Math.floor(Math.random() * pool.length)]!;
      setFlickerPosterUrl(m.posterUrl ?? null);
    }, FLICKER_MS);

    await new Promise<void>((r) => setTimeout(r, SPIN_MS));

    if (spinIntervalRef.current != null) {
      window.clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }

    if (cancelledRef.current) {
      pickLockRef.current = false;
      setUiPicking(false);
      return;
    }

    const { movie, nextPickedIds } = pickRandomMovie(list, pickedIds);
    setPickedIds(nextPickedIds);
    setPicked(movie);
    setFlickerPosterUrl(null);
    setPickPhase("revealed");
    pickLockRef.current = false;
    setUiPicking(false);
  }, [fetchState, pickedIds]);

  const handleFetch = useCallback(async () => {
    closePick();
    setPickedIds(new Set());
    setFetchState({ status: "loading" });
    const result = await fetchWatchlist(username);
    if (result.ok) {
      setFetchState({ status: "success", movies: result.movies });
    } else if (result.error === "empty") {
      setFetchState({ status: "empty" });
    } else {
      setFetchState({ status: "error", message: result.message });
    }
  }, [username, closePick]);

  useEffect(() => {
    if (fetchState.status === "success" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [fetchState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (typingTarget(e.target)) return;
      if (fetchState.status !== "success") return;
      if (pickLockRef.current) return;
      e.preventDefault();
      void runPick();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fetchState, runPick]);

  return (
    <div className="relative min-h-screen flex-1 overflow-x-hidden text-zinc-100">
      <AnimatedBackground />
      <FilmGrainOverlay />
      <CinematicLoadingScreen visible={loading} />

      <div
        className={`relative z-10 pb-24 transition-opacity duration-300 ${loading ? "pointer-events-none opacity-[0.15]" : "opacity-100"}`}
      >
        <LandingHero
          displayFontClass={displayFontClass}
          username={username}
          onUsernameChange={setUsername}
          onSubmit={handleFetch}
          loading={loading}
        />

        <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10">
          {fetchState.status === "error" ? (
            <StatusMessage title="Something went wrong" message={fetchState.message} />
          ) : null}
          {fetchState.status === "empty" ? (
            <EmptyWatchlist message="Add films to your Letterboxd watchlist and fetch again." />
          ) : null}
        </div>

        {fetchState.status === "success" ? (
          <section
            ref={resultsRef}
            className="mx-auto mt-10 max-w-6xl scroll-mt-20 px-4 pb-8 sm:mt-12 sm:scroll-mt-24 sm:pb-12"
          >
            <div className="mb-6 text-center sm:mb-8 sm:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500 sm:text-xs sm:tracking-[0.3em]">
                Your queue
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl md:text-3xl">
                {movies.length} {movies.length === 1 ? "film" : "films"} ready
              </h2>
            </div>
            <PickRandomBar
              onPick={() => void runPick()}
              disabled={movies.length === 0 || uiPicking}
              movieCount={movies.length}
            />
            <motion.div
              className="mt-8 sm:mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              <MovieGrid movies={movies} />
            </motion.div>
          </section>
        ) : null}
      </div>

      <FeaturedPickModal
        phase={pickPhase}
        flickerPosterUrl={flickerPosterUrl}
        movie={picked}
        onClose={closePick}
        onPickAnother={() => void runPick()}
      />
    </div>
  );
}
