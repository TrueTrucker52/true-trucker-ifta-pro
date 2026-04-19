import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../colors";

interface Props {
  variant?: "dark" | "orange" | "gradient";
  animated?: boolean;
}

export const Background: React.FC<Props> = ({
  variant = "dark",
  animated = true,
}) => {
  const frame = useCurrentFrame();

  const bgY = animated
    ? interpolate(frame, [0, 300], [0, -30], { extrapolateRight: "clamp" })
    : 0;

  const gradients = {
    dark: `radial-gradient(ellipse at 50% ${20 + bgY * 0.1}%, #1a0a2e 0%, #0A0A0F 60%)`,
    orange: `radial-gradient(ellipse at 50% 30%, #3d1800 0%, #0A0A0F 70%)`,
    gradient: `linear-gradient(160deg, #1a0520 0%, #0A0A0F 50%, #1a0800 100%)`,
  };

  return (
    <AbsoluteFill
      style={{
        background: gradients[variant],
        overflow: "hidden",
      }}
    >
      {/* Grid lines */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", opacity: 0.04 }}
      >
        <defs>
          <pattern
            id="grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          transform={`translateY(${bgY}px)`}
        />
      </svg>

      {/* Glow orbs */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}18 0%, transparent 70%)`,
          transform: `translate(${Math.sin(frame / 60) * 20}px, ${Math.cos(frame / 80) * 15}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-300px",
          right: "-200px",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gradient2}10 0%, transparent 70%)`,
          transform: `translate(${Math.cos(frame / 70) * 20}px, ${Math.sin(frame / 90) * 15}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
