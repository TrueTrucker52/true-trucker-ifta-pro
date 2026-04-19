import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Logo } from "../components/Logo";
import { COLORS } from "../colors";

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10, stiffness: 100, mass: 1 },
  });

  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [40, 65], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flashOpacity = interpolate(frame, [0, 8, 15], [1, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing orange glow
  const glowIntensity = 0.5 + 0.5 * Math.sin(frame / 10);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background variant="gradient" />

      {/* Flash effect on entry */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.primary,
          opacity: flashOpacity,
        }}
      />

      {/* Road streak lines */}
      {[0, 1, 2, 3, 4].map((i) => {
        const lineY = ((frame * 8 + i * 384) % 1920) - 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: lineY,
              width: 6,
              height: 120,
              marginLeft: -3,
              background: `linear-gradient(to bottom, transparent, ${COLORS.primary}40, transparent)`,
              borderRadius: 3,
            }}
          />
        );
      })}

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 60 }}>
          <Logo size={120} delay={5} showText={false} />
        </div>

        {/* Headline */}
        <div
          style={{
            transform: `scale(${titleScale})`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              textShadow: `0 0 60px ${COLORS.primary}${Math.round(glowIntensity * 80).toString(16).padStart(2, "0")}`,
            }}
          >
            STOP
            <br />
            <span
              style={{
                color: COLORS.primary,
                textShadow: `0 0 40px ${COLORS.primary}`,
              }}
            >
              WASTING
            </span>
            <br />
            HOURS ON
            <br />
            IFTA
          </div>
        </div>

        {/* Subtext */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: COLORS.gray,
              fontFamily: "sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            There's a better way
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom orange line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(to right, transparent, ${COLORS.primary}, transparent)`,
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
