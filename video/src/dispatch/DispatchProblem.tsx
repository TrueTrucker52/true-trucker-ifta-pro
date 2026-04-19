import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

const problems = [
  { icon: "📉", text: "Running empty miles\nbetween loads", delay: 10 },
  { icon: "💸", text: "Getting low-ball rates\nevery single load", delay: 50 },
  { icon: "😤", text: "Doing your own dispatching\nwhile trying to drive", delay: 90 },
];

const ProblemCard: React.FC<{ icon: string; text: string; delay: number }> = ({ icon, text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(progress, [0, 1], [-80, 0]);
  const strikeWidth = interpolate(frame - delay - 30, [0, 40], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ opacity, transform: `translateX(${x}px)`, background: `${COLORS.darkCard}CC`, border: `1px solid ${COLORS.darkBorder}`, borderRadius: 20, padding: "28px 36px", display: "flex", alignItems: "center", gap: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "#FF3366", borderRadius: "20px 0 0 20px" }} />
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.35, whiteSpace: "pre-line" }}>{text}</div>
      <div style={{ position: "absolute", left: 0, top: "50%", width: `${strikeWidth}%`, height: 3, background: "#FF3366", opacity: 0.7, marginTop: -1.5 }} />
    </div>
  );
};

export const DispatchProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, background: "radial-gradient(ellipse at 50% 20%, #1a0a2e 0%, #0A0A0F 60%)" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", gap: 32 }}>
        <div style={{ opacity: titleOpacity, marginBottom: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.primary, fontFamily: "sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Sound familiar?</div>
          <div style={{ fontSize: 62, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.1, letterSpacing: "-0.02em", marginTop: 8 }}>
            Dispatching<br />Yourself<br /><span style={{ color: "#FF3366" }}>Is Costing<br />You Money</span>
          </div>
        </div>
        {problems.map((p, i) => <ProblemCard key={i} {...p} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
