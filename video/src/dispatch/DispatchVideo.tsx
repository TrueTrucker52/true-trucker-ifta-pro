import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../colors";
import { DispatchHook } from "./DispatchHook";
import { DispatchProblem } from "./DispatchProblem";
import { DispatchSolution } from "./DispatchSolution";
import { DispatchFeatures } from "./DispatchFeatures";
import { DispatchPricing } from "./DispatchPricing";
import { DispatchCTA } from "./DispatchCTA";
import { DispatchBar } from "./DispatchBar";

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

// Hook:       0-5s    (0-150)
// Problem:    5-13s   (150-390)
// Solution:   13-20s  (390-600)
// Features:   20-40s  (600-1200)
// Pricing:    40-50s  (1200-1500)
// CTA:        50-60s  (1500-1800)

export const DispatchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      <Sequence from={0} durationInFrames={150}>
        <DispatchHook />
      </Sequence>
      <Sequence from={150} durationInFrames={240}>
        <DispatchProblem />
      </Sequence>
      <Sequence from={390} durationInFrames={210}>
        <DispatchSolution />
      </Sequence>
      <Sequence from={600} durationInFrames={600}>
        <DispatchFeatures />
      </Sequence>
      <Sequence from={1200} durationInFrames={300}>
        <DispatchPricing />
      </Sequence>
      <Sequence from={1500} durationInFrames={300}>
        <DispatchCTA />
      </Sequence>
      {/* Persistent apply bar from problem scene onward */}
      <Sequence from={150} durationInFrames={1650}>
        <DispatchBar />
      </Sequence>
    </AbsoluteFill>
  );
};
