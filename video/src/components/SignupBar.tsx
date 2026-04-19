import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../colors";

// Persistent bottom CTA bar shown on every scene after the hook
export const SignupBar: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulse = 0.85 + 0.15 * Math.abs(Math.sin(frame / 25));

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 110,
        opacity,
        background: `linear-gradient(to top, ${COLORS.dark}FF, ${COLORS.dark}CC, transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "0 40px",
      }}
    >
      {/* URL */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: COLORS.white,
          fontFamily: "sans-serif",
          letterSpacing: "0.01em",
          lineHeight: 1.3,
        }}
      >
        📲 <span style={{ color: COLORS.primary }}>Scan QR Code</span> to Sign Up Free
        <br />
        <span style={{ fontSize: 18, fontWeight: 500, color: COLORS.gray }}>
          true-trucker-ifta-pro.com/signup
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 2,
          height: 40,
          background: `${COLORS.primary}50`,
          borderRadius: 1,
        }}
      />

      {/* CTA button */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          borderRadius: 40,
          padding: "12px 28px",
          transform: `scale(${pulse})`,
          boxShadow: `0 0 20px ${COLORS.primary}60`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: COLORS.white,
            fontFamily: "sans-serif",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}
        >
          FREE 7-Day Trial →
        </div>
      </div>
    </div>
  );
};
