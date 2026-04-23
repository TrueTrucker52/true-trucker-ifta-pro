import { CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "./get-audio-duration";
import type { TruckingHistoryProps } from "./TruckingHistory";

const FPS = 30;
const TD = 15;   // transition overlap frames
const TAIL = 12; // silent hold frames after narration ends (gives visual breathing room)

const AUDIO_FILES = [
  "voiceover/scene1.mp3",
  "voiceover/scene2.mp3",
  "voiceover/scene3.mp3",
  "voiceover/scene4.mp3",
  "voiceover/scene5.mp3",
  "voiceover/scene6.mp3",
  "voiceover/scene7.mp3",
];

// Static fallback durations (frames) used before voiceovers are generated
const FALLBACK_DURATIONS = [210, 300, 270, 300, 270, 240, 300];

export const calculateMetadata: CalculateMetadataFunction<
  TruckingHistoryProps
> = async ({ props }) => {
  try {
    const durationsInSeconds = await Promise.all(
      AUDIO_FILES.map((f) => getAudioDuration(staticFile(f)))
    );

    // Each scene = narration frames + silent tail hold
    const sceneDurations = durationsInSeconds.map(
      (secs) => Math.ceil(secs * FPS) + TAIL
    );

    // Total composition = sum of scenes minus transition overlaps
    const totalFrames =
      sceneDurations.reduce((sum, d) => sum + d, 0) - 6 * TD;

    console.log(
      "[calculateMetadata] Scene durations (frames):",
      sceneDurations
    );
    console.log("[calculateMetadata] Total frames:", totalFrames);

    return {
      durationInFrames: totalFrames,
      props: { ...props, sceneDurations },
    };
  } catch {
    // Audio files not yet generated — use static fallback so Studio opens cleanly
    console.warn(
      "[calculateMetadata] Voiceover files not found — using fallback durations. " +
        "Run `node --strip-types generate-voiceover.ts` to generate them."
    );
    return {
      props: { ...props, sceneDurations: FALLBACK_DURATIONS },
    };
  }
};
