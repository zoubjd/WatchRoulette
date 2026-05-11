"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Scanning your watchlist…",
  "Matching films to TMDB…",
  "Pulling IMDb & Rotten Tomatoes scores…",
  "Preparing tonight’s feature…",
  "Building your cinema experience…",
];

type CinematicLoadingScreenProps = {
  visible: boolean;
};

export function CinematicLoadingScreen({ visible }: CinematicLoadingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const reset = window.setTimeout(() => {
      setMsgIndex(0);
      setTick(0);
    }, 0);
    const m = window.setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2400);
    const t = window.setInterval(() => setTick((x) => x + 1), 120);
    return () => {
      window.clearTimeout(reset);
      window.clearInterval(m);
      window.clearInterval(t);
    };
  }, [visible]);

  const progress = Math.min(92, tick * 0.35);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="load"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-zinc-950/94 px-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "220px 220px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12)_0%,transparent_55%)]" />

          <div className="relative flex max-w-md flex-col items-center text-center">
            <div className="relative mb-10 flex h-40 w-64 items-center justify-center sm:h-44 sm:w-72">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute aspect-[2/3] w-[38%] rounded-lg bg-gradient-to-br from-zinc-600/40 to-zinc-950/90 ring-1 ring-white/15"
                  style={{ zIndex: 3 - i }}
                  animate={{
                    x: [0, i === 0 ? -18 : i === 1 ? 0 : 18, 0],
                    y: [0, i === 1 ? -10 : 6, 0],
                    rotate: [i * 4 - 4, i * 5 - 2, i * 4 - 4],
                    opacity: [0.55, 0.85, 0.55],
                  }}
                  transition={{
                    duration: 2.4 + i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.12,
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-balance text-base font-medium leading-snug text-zinc-200 sm:text-lg"
              >
                {MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="mt-3 text-sm text-zinc-500">Hang tight — this can take a few seconds.</p>

            <div className="mt-10 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
