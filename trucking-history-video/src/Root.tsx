import "./index.css";
import { Composition } from "remotion";
import { TruckingHistory, type TruckingHistoryProps } from "./TruckingHistory";
import { calculateMetadata } from "./calculateMetadata";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

// Fallback durations used before voiceovers are generated.
// calculateMetadata overrides these once audio files exist.
const DEFAULT_SCENE_DURATIONS = [210, 300, 270, 300, 270, 240, 300];
const DEFAULT_TOTAL =
  DEFAULT_SCENE_DURATIONS.reduce((s, d) => s + d, 0) - 6 * 15;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TruckingHistory-Ep1"
      component={TruckingHistory}
      durationInFrames={DEFAULT_TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={
        {
          sceneDurations: DEFAULT_SCENE_DURATIONS,
        } satisfies TruckingHistoryProps
      }
      calculateMetadata={calculateMetadata}
    />
  );
};
