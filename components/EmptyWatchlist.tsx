"use client";

import { motion } from "framer-motion";
import { Film } from "lucide-react";

type EmptyWatchlistProps = {
  message: string;
};

export function EmptyWatchlist({ message }: EmptyWatchlistProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-12 text-center shadow-2xl shadow-black/50 backdrop-blur-md"
    >
      <Film className="mb-4 h-12 w-12 text-zinc-600" strokeWidth={1.25} aria-hidden />
      <h2 className="text-lg font-semibold text-zinc-200">Nothing on the list</h2>
      <p className="mt-2 text-sm text-zinc-500">{message}</p>
    </motion.div>
  );
}
