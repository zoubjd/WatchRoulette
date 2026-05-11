import { Instrument_Serif } from "next/font/google";
import { WatchRoulette } from "@/components/WatchRoulette";

const displaySerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return <WatchRoulette displayFontClass={displaySerif.className} />;
}
