import type { Movie } from "./types";

/** Stable id from Letterboxd film URL slug (used for keys + random-pick history). */
export function movieStableId(m: Pick<Movie, "letterboxdUrl">): string {
  const match = m.letterboxdUrl.match(/\/film\/([^/]+)\/?/i);
  if (match?.[1]) return match[1].toLowerCase();
  try {
    const path = new URL(m.letterboxdUrl).pathname;
    return path.replace(/\W+/g, "-").replace(/^-|-$/g, "").slice(0, 96).toLowerCase() || "film";
  } catch {
    return m.letterboxdUrl.slice(0, 96).toLowerCase();
  }
}
