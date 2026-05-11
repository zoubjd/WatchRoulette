"use client";

import { motion } from "framer-motion";
import { WatchlistQueryForm } from "./WatchlistQueryForm";

const collage = [
  { rotate: -12, x: "-8%", y: "12%", w: "w-[28%]", delay: 0 },
  { rotate: 8, x: "72%", y: "8%", w: "w-[26%]", delay: 0.15 },
  { rotate: -6, x: "58%", y: "52%", w: "w-[22%]", delay: 0.08 },
  { rotate: 14, x: "6%", y: "58%", w: "w-[24%]", delay: 0.22 },
  { rotate: -4, x: "38%", y: "4%", w: "w-[18%]", delay: 0.12 },
];

type LandingHeroProps = {
  displayFontClass: string;
  username: string;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function LandingHero({
  displayFontClass,
  username,
  onUsernameChange,
  onSubmit,
  loading,
}: LandingHeroProps) {
  return (
    <section className="relative z-10 overflow-hidden px-4 pb-12 pt-10 sm:pb-16 sm:pt-14 md:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[min(70vh,520px)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_72%,rgba(0,0,0,0.88)_100%)]" />
        <motion.div
          className="absolute left-1/2 top-[18%] h-72 w-[min(90vw,480px)] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[100px]"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {collage.map((c, i) => (
          <motion.div
            key={i}
            className={`absolute ${c.w} max-w-[140px] aspect-[2/3] rounded-lg bg-gradient-to-br from-zinc-700/50 via-zinc-900/60 to-black/80 opacity-[0.14] shadow-2xl ring-1 ring-white/10 sm:opacity-[0.18]`}
            style={{ left: c.x, top: c.y, rotate: `${c.rotate}deg` }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 + c.delay }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.42em] text-zinc-500 sm:text-xs sm:tracking-[0.38em]"
        >
          Your next feature presentation
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className={`${displayFontClass} text-balance px-1 text-[clamp(2rem,8vw,3.75rem)] font-normal leading-[1.02] tracking-tight text-zinc-50 sm:leading-[1.04] md:text-[clamp(2.75rem,6.5vw,4.25rem)]`}
        >
          Stop scrolling.
          <span className="mt-2 block bg-gradient-to-r from-zinc-100 via-white to-zinc-400 bg-clip-text text-transparent sm:mt-3">
            Start watching.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto mt-5 max-w-md text-pretty px-2 text-[15px] leading-relaxed text-zinc-400 sm:mt-6 sm:text-base sm:leading-relaxed"
        >
          Pull your watchlist. Let fate decide tonight&apos;s movie.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="mx-auto mt-9 max-w-xl sm:mt-11"
        >
          <div className="relative rounded-2xl border border-white/[0.12] bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-5 sm:shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_32px_100px_-28px_rgba(0,0,0,0.9)]">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/[0.07] via-transparent to-violet-500/[0.06]" />
            <WatchlistQueryForm
              username={username}
              onUsernameChange={onUsernameChange}
              onSubmit={onSubmit}
              loading={loading}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
