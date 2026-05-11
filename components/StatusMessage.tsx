"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

type StatusMessageProps = {
  title: string;
  message: string;
};

export function StatusMessage({ title, message }: StatusMessageProps) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-lg gap-3 rounded-xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-left shadow-lg shadow-red-950/20 backdrop-blur-md"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-red-200">{title}</p>
        <p className="mt-1 text-sm text-red-100/80">{message}</p>
      </div>
    </motion.div>
  );
}
