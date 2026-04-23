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

// Scene durations in frames (30 fps)
// 7 scenes − 6 transitions × 15 frames = 1890 − 90 = 1800 frames (60s)
const S1 = 210; // Hook       — 7s
const S2 = 300; // 1896       — 10s
const S3 = 270; // Wars       — 9s
const S4 = 300; // Interstate — 10s
const S5 = 270; // Golden Age — 9s
const S6 = 240; // Today      — 8s
const S7 = 300; // CTA        — 10s

const TD = 15; // transition overlap in frames

const forward = slide({ direction: "from-right" });

export const TruckingHistory: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S1}>
          <Scene1Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={S2}>
          <Scene2FirstTruck />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={S3}>
          <Scene3Wars />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={S4}>
          <Scene4Interstate />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={forward}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={S5}>
          <Scene5GoldenAge />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={S6}>
          <Scene6Today />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TD })}
        />

        <TransitionSeries.Sequence durationInFrames={S7}>
          <Scene7CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
