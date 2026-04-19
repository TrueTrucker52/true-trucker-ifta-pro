import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { COLORS } from "./colors";
import { SignupBar } from "./components/SignupBar";
import { SceneHook } from "./scenes/SceneHook";
import { SceneProblem } from "./scenes/SceneProblem";
import { SceneSolution } from "./scenes/SceneSolution";
import { SceneFeatures } from "./scenes/SceneFeatures";
import { SceneSocialProof } from "./scenes/SceneSocialProof";
import { ScenePricing } from "./scenes/ScenePricing";
import { SceneCTA } from "./scenes/SceneCTA";

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

// Scene timing (30fps)
// Hook:        0-5s    (0-150)
// Problem:     5-13s   (150-390)
// Solution:    13-20s  (390-600)
// Features:    20-40s  (600-1200)
// SocialProof: 40-48s  (1200-1440)
// Pricing:     48-54s  (1440-1620)
// CTA:         54-60s  (1620-1800)

export const SalesVideo: React.FC = () => {
  // Set VOICEOVER=true after dropping voiceover.mp3 into video/public/
  const VOICEOVER = false;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Voiceover audio — generate via HeyGen Studio with "True Trucking" voice,
          save as voiceover.mp3 in video/public/, then set VOICEOVER=true above */}
      {VOICEOVER && <Audio src={staticFile("voiceover.mp3")} />}

      <Sequence from={0} durationInFrames={150}>
        <SceneHook />
      </Sequence>

      <Sequence from={150} durationInFrames={240}>
        <SceneProblem />
      </Sequence>

      <Sequence from={390} durationInFrames={210}>
        <SceneSolution />
      </Sequence>

      <Sequence from={600} durationInFrames={600}>
        <SceneFeatures />
      </Sequence>

      <Sequence from={1200} durationInFrames={240}>
        <SceneSocialProof />
      </Sequence>

      <Sequence from={1440} durationInFrames={180}>
        <ScenePricing />
      </Sequence>

      <Sequence from={1620} durationInFrames={180}>
        <SceneCTA />
      </Sequence>

      {/* Persistent signup bar on every scene after the hook (5s in) */}
      <Sequence from={150} durationInFrames={1650}>
        <SignupBar />
      </Sequence>
    </AbsoluteFill>
  );
};
