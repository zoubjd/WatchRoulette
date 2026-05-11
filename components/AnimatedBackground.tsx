"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-emerald-500/10 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-[60vh] w-[60vw] rounded-full bg-violet-600/12 blur-[130px]"
        animate={{ x: [0, -50, 0], y: [0, -40, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-[40vh] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/8 blur-[100px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-black" />
    </div>
  );
}
