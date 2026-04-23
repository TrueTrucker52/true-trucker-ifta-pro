import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const { fontFamily: HEADING } = loadOswald("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const { fontFamily: BODY } = loadInter("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});
