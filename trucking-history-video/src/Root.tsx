import "./index.css";
import { Composition } from "remotion";
import { TruckingHistory } from "./TruckingHistory";

// 9:16 vertical — YouTube Shorts / Facebook Reels
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
// 7 scenes (1890 frames) − 6 transitions × 15 frames = 1800 frames = 60 seconds
const DURATION_FRAMES = 1800;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TruckingHistory-Ep1"
      component={TruckingHistory}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
