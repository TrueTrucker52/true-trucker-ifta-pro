import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

export const DispatchPricing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bigNumScale = spring({ frame: frame - 10, fps, config: { damping: 8, stiffness: 130, mass: 0.7 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [265, 300], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const perks = [
    { icon: "✅", text: "No setup fees", delay: 60 },
    { icon: "✅", text: "No long-term contracts", delay: 80 },
    { icon: "✅", text: "$0 upfront cost", delay: 100 },
    { icon: "✅", text: "Cancel anytime", delay: 120 },
    { icon: "✅", text: "No forced dispatch", delay: 140 },
    { icon: "✅", text: "24/7 dedicated support", delay: 160 },
  ];

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, background: "radial-gradient(ellipse at 50% 30%, #3d1800 0%, #0A0A0F 70%)" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px", gap: 0 }}>
        {/* Header */}
        <div style={{ opacity: titleOpacity, textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.gray, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Simple pricing</div>
        </div>

        {/* Big 10% */}
        <div style={{ transform: `scale(${bigNumScale})`, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 180, fontWeight: 900, color: COLORS.primary, fontFamily: "sans-serif", lineHeight: 0.9, letterSpacing: "-0.05em", textShadow: `0 0 80px ${COLORS.primary}60` }}>
            10%
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: COLORS.white, fontFamily: "sans-serif", marginTop: 16 }}>
            That's It.
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: COLORS.gray, fontFamily: "sans-serif", marginTop: 8 }}>
            You keep <span style={{ color: COLORS.primary, fontWeight: 800 }}>90 cents of every dollar</span>
          </div>
        </div>

        {/* Perks grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginTop: 32 }}>
          {perks.map((p) => {
            const op = interpolate(frame - p.delay, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={p.text} style={{ opacity: op, background: `${COLORS.darkCard}CC`, border: `1px solid ${COLORS.primary}30`, borderRadius: 40, padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: COLORS.white, fontFamily: "sans-serif" }}>{p.text}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom banner */}
        <div style={{ opacity: interpolate(frame, [180, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), marginTop: 44, background: `linear-gradient(135deg, ${COLORS.primary}30, ${COLORS.darkCard})`, border: `2px solid ${COLORS.primary}60`, borderRadius: 20, padding: "24px 40px", textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif" }}>
            No setup fees. No gimmicks.
          </div>
          <div style={{ fontSize: 22, color: COLORS.gray, fontFamily: "sans-serif", marginTop: 6 }}>
            Start today. Cancel anytime.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
