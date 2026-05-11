"use client";

import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";

type PickRandomBarProps = {
  onPick: () => void;
  disabled: boolean;
  movieCount: number;
};

export function PickRandomBar({ onPick, disabled, movieCount }: PickRandomBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-3 z-20 mx-auto flex w-full max-w-2xl flex-col items-stretch gap-3 px-1 sm:top-4 sm:flex-row sm:items-center sm:justify-center sm:gap-2 sm:px-4"
    >
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onPick}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className="relative inline-flex min-h-[3.25rem] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-100 via-white to-zinc-200 px-6 text-[15px] font-bold tracking-wide text-zinc-950 shadow-[0_0_40px_-10px_rgba(255,255,255,0.35)] transition disabled:pointer-events-none disabled:opacity-40 sm:h-14 sm:min-h-0 sm:w-auto sm:min-w-[280px] sm:px-8 sm:text-base"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:opacity-100" />
        <Shuffle className="h-5 w-5" aria-hidden />
        Pick Random Movie
      </motion.button>
      <p className="text-center text-[13px] leading-snug text-zinc-500 sm:text-left sm:text-sm">
        {movieCount} {movieCount === 1 ? "title" : "titles"} in play · press{" "}
        <kbd className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-400 sm:text-[10px]">
          Space
        </kbd>{" "}
        to reroll
      </p>
    </motion.div>
  );
}
