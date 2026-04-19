import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

const features = [
  { icon: "💰", title: "Only 10% Dispatch Fee", desc: "No hidden fees. No contracts. You keep 90% of every load.", stat: "Lowest Rate", color: COLORS.primary },
  { icon: "📞", title: "24/7 Dispatch Support", desc: "Your dedicated dispatcher is always one call away. Day or night.", stat: "Always On", color: "#3B82F6" },
  { icon: "🚫", title: "No Forced Dispatch", desc: "You choose your loads. Your truck, your rules. Period.", stat: "Your Choice", color: "#22C55E" },
  { icon: "📈", title: "Top Rate Negotiation", desc: "We fight for every dollar on every load so you earn more per mile.", stat: "Max Rates", color: "#A855F7" },
  { icon: "🗂️", title: "Premium Load Boards", desc: "DAT, Truckstop & direct broker relationships. Loads others can't see.", stat: "Premium Access", color: "#F59E0B" },
  { icon: "📋", title: "Full Back-Office Support", desc: "BOLs, invoicing, factoring & IFTA reporting — we handle it all.", stat: "$0 Extra", color: "#EC4899" },
];

const FeatureCard: React.FC<{ feature: typeof features[0]; frameOffset: number }> = ({ feature, frameOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - frameOffset, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const opacity = interpolate(frame - frameOffset, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(progress, [0, 1], [60, 0]);

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, background: `${COLORS.darkCard}EE`, border: `1px solid ${feature.color}30`, borderRadius: 22, padding: "26px 32px", display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 0% 50%, ${feature.color}12 0%, transparent 60%)` }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: feature.color, borderRadius: "22px 0 0 22px" }} />
      <div style={{ width: 66, height: 66, borderRadius: 16, background: `${feature.color}22`, border: `1px solid ${feature.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, flexShrink: 0 }}>{feature.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.2 }}>{feature.title}</div>
        <div style={{ fontSize: 20, fontWeight: 400, color: COLORS.gray, fontFamily: "sans-serif", lineHeight: 1.35, marginTop: 4 }}>{feature.desc}</div>
      </div>
      <div style={{ background: `${feature.color}22`, border: `1px solid ${feature.color}50`, borderRadius: 10, padding: "6px 14px", flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: feature.color, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>{feature.stat}</div>
      </div>
    </div>
  );
};

export const DispatchFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [560, 600], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrollY = interpolate(frame, [280, 400], [0, -380], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, background: "radial-gradient(ellipse at 50% 20%, #1a0a2e 0%, #0A0A0F 60%)" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", padding: "60px 60px 80px", overflow: "hidden" }}>
        <div style={{ opacity: titleOpacity, marginBottom: 32, flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary, fontFamily: "sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>What you get</div>
          <div style={{ fontSize: 58, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.1, letterSpacing: "-0.02em", marginTop: 6 }}>
            We Handle<br /><span style={{ color: COLORS.primary }}>Everything.</span><br />You Drive.
          </div>
        </div>
        <div style={{ transform: `translateY(${scrollY}px)`, display: "flex", flexDirection: "column", gap: 18 }}>
          {features.map((f, i) => <FeatureCard key={i} feature={f} frameOffset={20 + i * 25} />)}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
