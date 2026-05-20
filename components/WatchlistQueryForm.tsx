"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type WatchlistQueryFormProps = {
  username: string;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function WatchlistQueryForm({
  username,
  onUsernameChange,
  onSubmit,
  loading,
}: WatchlistQueryFormProps) {
  return (
    <motion.form
      initial={false}
      animate={{ opacity: 1 }}
      className="relative z-10 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="sr-only" htmlFor="lb-username">
        Letterboxd username or list URL
      </label>
      <input
        id="lb-username"
        name="username"
        autoComplete="username"
        placeholder="Username, watchlist, or list URL"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        disabled={loading}
        className="min-h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base text-zinc-100 shadow-inner shadow-black/50 outline-none ring-emerald-500/0 transition placeholder:text-zinc-600 focus:border-emerald-500/35 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 sm:min-h-12 sm:flex-1 sm:text-[15px]"
      />
      <motion.button
        type="submit"
        disabled={loading || !username.trim()}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        className="inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-base font-semibold text-white shadow-lg shadow-emerald-950/35 transition hover:from-emerald-500 hover:to-teal-500 disabled:pointer-events-none disabled:opacity-40 sm:min-h-12 sm:w-auto sm:min-w-[200px] sm:px-8"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
            Working…
          </>
        ) : (
          "Fetch list"
        )}
      </motion.button>
    </motion.form>
  );
}
