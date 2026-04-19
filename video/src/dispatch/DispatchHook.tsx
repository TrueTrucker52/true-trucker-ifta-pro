import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

export const DispatchHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 100, mass: 1 } });
  const subOpacity = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [45, 70], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [120, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOpacity = interpolate(frame, [0, 8, 15], [1, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = 0.5 + 0.5 * Math.sin(frame / 10);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, background: "radial-gradient(ellipse at 50% 30%, #1a0800 0%, #0A0A0F 70%)", overflow: "hidden" }}>
      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: COLORS.primary, opacity: flashOpacity }} />

      {/* Road lines */}
      {[0,1,2,3,4].map(i => {
        const y = ((frame * 8 + i * 384) % 1920) - 100;
        return <div key={i} style={{ position: "absolute", left: "50%", top: y, width: 6, height: 120, marginLeft: -3, background: `linear-gradient(to bottom, transparent, ${COLORS.primary}40, transparent)`, borderRadius: 3 }} />;
      })}

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
        {/* Truck icon */}
        <div style={{ fontSize: 100, marginBottom: 40, filter: `drop-shadow(0 0 30px ${COLORS.primary})`, transform: `scale(${scale})` }}>🚛</div>

        <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
          <div style={{ fontSize: 90, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.0, letterSpacing: "-0.03em", textShadow: `0 0 60px ${COLORS.primary}${Math.round(glow * 80).toString(16).padStart(2, "0")}` }}>
            GET
            <br />
            <span style={{ color: COLORS.primary }}>DISPATCHED.</span>
            <br />
            STAY
            <br />
            LOADED.
          </div>
        </div>

        <div style={{ opacity: subOpacity, transform: `translateY(${subY}px)`, marginTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.primary, fontFamily: "sans-serif" }}>
            Keep More Money. 💰
          </div>
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: `linear-gradient(to right, transparent, ${COLORS.primary}, transparent)` }} />
    </AbsoluteFill>
  );
};
