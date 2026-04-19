import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

interface Props {
  size?: number;
  delay?: number;
  showText?: boolean;
}

export const Logo: React.FC<Props> = ({
  size = 100,
  delay = 0,
  showText = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.6 },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Truck icon SVG */}
      <div
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          borderRadius: size * 0.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 ${size * 0.4}px ${COLORS.primary}60`,
        }}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 64 64"
          fill="none"
        >
          {/* Truck body */}
          <rect x="4" y="22" width="38" height="24" rx="3" fill="white" />
          {/* Cab */}
          <path
            d="M42 30 L56 30 L60 38 L60 46 L42 46 Z"
            fill="white"
            opacity="0.9"
          />
          {/* Windshield */}
          <path
            d="M44 32 L54 32 L57 38 L44 38 Z"
            fill={COLORS.primary}
            opacity="0.6"
          />
          {/* Wheels */}
          <circle cx="16" cy="48" r="7" fill={COLORS.dark} />
          <circle cx="16" cy="48" r="3.5" fill={COLORS.gray} />
          <circle cx="50" cy="48" r="7" fill={COLORS.dark} />
          <circle cx="50" cy="48" r="3.5" fill={COLORS.gray} />
          {/* IFTA lines on truck body */}
          <rect x="8" y="28" width="14" height="2" rx="1" fill={COLORS.primary} opacity="0.6" />
          <rect x="8" y="33" width="10" height="2" rx="1" fill={COLORS.primary} opacity="0.4" />
        </svg>
      </div>

      {showText && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: size * 0.28,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            TRUE<span style={{ color: COLORS.primary }}>TRUCKER</span>
          </div>
          <div
            style={{
              fontSize: size * 0.16,
              fontWeight: 600,
              color: COLORS.gray,
              fontFamily: "sans-serif",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            IFTA Pro
          </div>
        </div>
      )}
    </div>
  );
};
