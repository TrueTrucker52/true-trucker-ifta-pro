import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2FirstTruck } from "./scenes/Scene2FirstTruck";
import { Scene3Wars } from "./scenes/Scene3Wars";
import { Scene4Interstate } from "./scenes/Scene4Interstate";
import { Scene5GoldenAge } from "./scenes/Scene5GoldenAge";
import { Scene6Today } from "./scenes/Scene6Today";
import { Scene7CTA } from "./scenes/Scene7CTA";

export type TruckingHistoryProps = {
  sceneDurations: number[]; // per-scene frame counts, driven by audio durations
};

const TD = 15; // transition overlap in frames
const forward = slide({ direction: "from-right" });

export const TruckingHistory: React.FC<TruckingHistoryProps> = ({
  sceneDurations,
}) => {
  const [s1, s2, s3, s4, s5, s6, s7] = sceneDurations;

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={s1}>
          <Scene1Hook durationInFrames={s1} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={s2}>
          <Scene2FirstTruck durationInFrames={s2} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={s3}>
          <Scene3Wars durationInFrames={s3} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={s4}>
          <Scene4Interstate durationInFrames={s4} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={s5}>
          <Scene5GoldenAge durationInFrames={s5} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={s6}>
          <Scene6Today durationInFrames={s6} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={s7}>
          <Scene7CTA durationInFrames={s7} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
