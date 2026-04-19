import { Composition } from "remotion";
import { SalesVideo, VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./SalesVideo";

export const Root: React.FC = () => {
  return (
    <Composition
      id="SalesVideo"
      component={SalesVideo}
      durationInFrames={VIDEO_FPS * 60}
      fps={VIDEO_FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
