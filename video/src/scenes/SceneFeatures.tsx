import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { COLORS } from "../colors";

interface Feature {
  icon: string;
  title: string;
  desc: string;
  stat: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: "📋",
    title: "Auto IFTA Filing",
    desc: "Tracks miles by state automatically. Calculates fuel tax. Done.",
    stat: "10 min/quarter",
    color: COLORS.primary,
  },
  {
    icon: "🚛",
    title: "FMCSA-Certified ELD",
    desc: "Pass DOT inspections with one tap. Stay 100% legal on the road.",
    stat: "100% Compliant",
    color: "#3B82F6",
  },
  {
    icon: "📷",
    title: "BOL Camera Scanner",
    desc: "Scan bills of lading in seconds. Auto-extracts all data.",
    stat: "Instant Scan",
    color: "#22C55E",
  },
  {
    icon: "📍",
    title: "Live GPS Tracking",
    desc: "Real-time location for every truck in your fleet. 24/7.",
    stat: "Real-Time",
    color: "#A855F7",
  },
  {
    icon: "🤖",
    title: "AI Assistant",
    desc: "Ask any IFTA or trucking question. Get instant expert answers.",
    stat: "Always On",
    color: "#F59E0B",
  },
];

const FeatureCard: React.FC<{ feature: Feature; frameOffset: number }> = ({
  feature,
  frameOffset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - frameOffset,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.9 },
  });

  const opacity = interpolate(frame - frameOffset, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [60, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        background: `${COLORS.darkCard}EE`,
        border: `1px solid ${feature.color}30`,
        borderRadius: 24,
        padding: "30px 36px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow behind */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 0% 50%, ${feature.color}12 0%, transparent 60%)`,
        }}
      />

      {/* Left accent */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: feature.color,
          borderRadius: "24px 0 0 24px",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: `${feature.color}22`,
          border: `1px solid ${feature.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          flexShrink: 0,
        }}
      >
        {feature.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: COLORS.white,
            fontFamily: "sans-serif",
            lineHeight: 1.2,
          }}
        >
          {feature.title}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: COLORS.gray,
            fontFamily: "sans-serif",
            lineHeight: 1.35,
            marginTop: 6,
          }}
        >
          {feature.desc}
        </div>
      </div>

      {/* Stat badge */}
      <div
        style={{
          background: `${feature.color}22`,
          border: `1px solid ${feature.color}50`,
          borderRadius: 12,
          padding: "8px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: feature.color,
            fontFamily: "sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {feature.stat}
        </div>
      </div>
    </div>
  );
};

// Show all 5 features, staggered over 600 frames (20s)
// Each feature card appears with delay, then we scroll through them
const FEATURES_PER_VIEW = 3;
const STAGGER = 25;

export const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [560, 600], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scroll: show first 3 from 0-300, then transition to last 2 from 350-600
  const scrollY = interpolate(frame, [280, 380], [0, -340], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background variant="dark" animated={false} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "60px 60px 80px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: titleOpacity,
            marginBottom: 36,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.primary,
              fontFamily: "sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Everything you need
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: 6,
            }}
          >
            One App.
            <br />
            <span style={{ color: COLORS.primary }}>All</span> Features.
          </div>
        </div>

        {/* Feature cards container with scroll */}
        <div
          style={{
            transform: `translateY(${scrollY}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} frameOffset={20 + i * STAGGER} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
