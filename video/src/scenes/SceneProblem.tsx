import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { COLORS } from "../colors";

const problems = [
  { icon: "⏰", text: "4 hours every quarter\non manual filing", delay: 10 },
  { icon: "💸", text: "$2,400 fine from\none mileage mistake", delay: 50 },
  { icon: "📄", text: "Lost BOLs &\nduplicated work", delay: 90 },
];

const ProblemCard: React.FC<{
  icon: string;
  text: string;
  delay: number;
  index: number;
}> = ({ icon, text, delay, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const x = interpolate(progress, [0, 1], [-80, 0]);
  const strikeWidth = interpolate(frame - delay - 30, [0, 40], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        background: `${COLORS.darkCard}CC`,
        border: `1px solid ${COLORS.darkBorder}`,
        borderRadius: 20,
        padding: "28px 36px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Red accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: "#FF3366",
          borderRadius: "20px 0 0 20px",
        }}
      />

      <div style={{ fontSize: 52 }}>{icon}</div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: COLORS.white,
            fontFamily: "sans-serif",
            lineHeight: 1.35,
            whiteSpace: "pre-line",
          }}
        >
          {text}
        </div>
      </div>

      {/* Strike-through overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: `${strikeWidth}%`,
          height: 3,
          background: "#FF3366",
          opacity: 0.7,
          marginTop: -1.5,
        }}
      />
    </div>
  );
};

export const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 20], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background variant="dark" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 60px",
          gap: 32,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.primary,
              fontFamily: "sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Sound familiar?
          </div>
          <div
            style={{
              fontSize: 62,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: 8,
            }}
          >
            The Old Way
            <br />
            <span style={{ color: "#FF3366" }}>Is Killing</span>
            <br />
            Your Time
          </div>
        </div>

        {/* Problem cards */}
        {problems.map((p, i) => (
          <ProblemCard key={i} {...p} index={i} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
