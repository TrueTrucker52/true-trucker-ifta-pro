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

const plans = [
  { name: "Solo", price: "$39", unit: "/mo", desc: "1 truck · All IFTA features", highlight: false, delay: 30 },
  { name: "Small Fleet", price: "$79", unit: "/mo", desc: "2–5 trucks · Fleet management", highlight: true, delay: 60 },
  { name: "Fleet Pro", price: "$129", unit: "/mo", desc: "6–10 trucks · Advanced analytics", highlight: false, delay: 90 },
];

const PlanCard: React.FC<{
  name: string;
  price: string;
  unit: string;
  desc: string;
  highlight: boolean;
  delay: number;
}> = ({ name, price, unit, desc, highlight, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [60, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        background: highlight
          ? `linear-gradient(135deg, ${COLORS.primary}30, ${COLORS.darkCard})`
          : `${COLORS.darkCard}CC`,
        border: `${highlight ? 2 : 1}px solid ${highlight ? COLORS.primary : COLORS.darkBorder}`,
        borderRadius: 20,
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: COLORS.primary,
            color: COLORS.white,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "sans-serif",
            padding: "4px 12px",
            borderRadius: 20,
            letterSpacing: "0.05em",
          }}
        >
          POPULAR
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: highlight ? COLORS.primary : COLORS.white,
            fontFamily: "sans-serif",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 18,
            color: COLORS.gray,
            fontFamily: "sans-serif",
            marginTop: 4,
          }}
        >
          {desc}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <span
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: COLORS.white,
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          {price}
        </span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: COLORS.gray,
            fontFamily: "sans-serif",
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
};

export const ScenePricing: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const promoOpacity = interpolate(frame, [110, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [155, 180], [1, 0], {
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
          padding: "60px 60px",
          gap: 24,
        }}
      >
        {/* Header */}
        <div style={{ opacity: titleOpacity, marginBottom: 8 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.primary,
              fontFamily: "sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Simple Pricing
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: 6,
            }}
          >
            More Features.
            <br />
            <span style={{ color: COLORS.primary }}>Lower Price.</span>
          </div>
        </div>

        {/* Plans */}
        {plans.map((p, i) => (
          <PlanCard key={i} {...p} />
        ))}

        {/* Promo code */}
        <div
          style={{
            opacity: promoOpacity,
            background: `${COLORS.yellow}18`,
            border: `1px solid ${COLORS.yellow}50`,
            borderRadius: 16,
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 32 }}>🏷️</div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.yellow,
                fontFamily: "sans-serif",
              }}
            >
              Use code LAUNCH20
            </div>
            <div
              style={{
                fontSize: 18,
                color: COLORS.gray,
                fontFamily: "sans-serif",
              }}
            >
              20% off your first 3 months
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
