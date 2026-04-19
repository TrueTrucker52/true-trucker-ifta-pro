import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

export const DispatchSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 120, mass: 0.8 } });
  const textOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [40, 65], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [175, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring1 = 1 + interpolate(frame % 60, [0, 60], [0, 0.5]);
  const ringOp1 = interpolate(frame % 60, [0, 60], [0.4, 0]);
  const ring2 = 1 + interpolate((frame + 20) % 60, [0, 60], [0, 0.5]);
  const ringOp2 = interpolate((frame + 20) % 60, [0, 60], [0.4, 0]);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, background: "radial-gradient(ellipse at 50% 30%, #3d1800 0%, #0A0A0F 70%)" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
        {/* Pulsing icon */}
        <div style={{ position: "relative", marginBottom: 60 }}>
          {[{ s: ring1, o: ringOp1 }, { s: ring2, o: ringOp2 }].map((r, i) => (
            <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: 200, height: 200, marginTop: -100, marginLeft: -100, borderRadius: "50%", border: `2px solid ${COLORS.primary}`, transform: `scale(${r.s})`, opacity: r.o }} />
          ))}
          <div style={{ transform: `scale(${logoScale})`, width: 140, height: 140, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, boxShadow: `0 0 60px ${COLORS.primary}60` }}>
            🚛
          </div>
        </div>

        <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)`, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.gray, fontFamily: "sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Introducing</div>
          <div style={{ fontSize: 68, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.0, letterSpacing: "-0.03em" }}>
            TRUE TRUCKING
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: COLORS.primary, fontFamily: "sans-serif", letterSpacing: "0.02em", marginTop: 4 }}>
            DISPATCH
          </div>
        </div>

        <div style={{ opacity: taglineOpacity, marginTop: 48, textAlign: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 500, color: COLORS.grayLight, fontFamily: "sans-serif", lineHeight: 1.45 }}>
            Professional dispatch<br />
            <span style={{ color: COLORS.primary, fontWeight: 800 }}>built by a trucker,</span><br />
            for truckers.
          </div>
        </div>

        <div style={{ opacity: taglineOpacity, marginTop: 44, background: `${COLORS.primary}22`, border: `1px solid ${COLORS.primary}60`, borderRadius: 50, padding: "14px 36px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary, fontFamily: "sans-serif", letterSpacing: "0.05em" }}>
            You keep 90¢ of every dollar
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
