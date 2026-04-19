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

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });

  const ctaScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.6 },
  });

  const urlOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlY = interpolate(frame, [60, 90], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgesOpacity = interpolate(frame, [80, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing button
  const buttonPulse = 1 + 0.03 * Math.sin(frame / 8);

  // Particle burst
  const particleRadius = interpolate(frame, [0, 40], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const particleOpacity = interpolate(frame, [0, 40], [0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background variant="gradient" />

      {/* Burst rings */}
      {[1, 1.5, 2].map((mult, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: particleRadius * mult * 2,
            height: particleRadius * mult * 2,
            marginTop: -(particleRadius * mult),
            marginLeft: -(particleRadius * mult),
            borderRadius: "50%",
            border: `3px solid ${COLORS.primary}`,
            opacity: particleOpacity / mult,
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            marginBottom: 48,
          }}
        >
          <Logo size={110} delay={5} showText={true} />
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${ctaScale * buttonPulse})`,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            borderRadius: 20,
            padding: "32px 56px",
            textAlign: "center",
            boxShadow: `0 0 60px ${COLORS.primary}60, 0 20px 40px ${COLORS.primary}40`,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 50,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            TRY FREE
            <br />7 DAYS
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              fontFamily: "sans-serif",
              marginTop: 8,
              letterSpacing: "0.05em",
            }}
          >
            No credit card required
          </div>
        </div>

        {/* Website URL */}
        <div
          style={{
            opacity: urlOpacity,
            transform: `translateY(${urlY}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.white,
              fontFamily: "sans-serif",
              background: `${COLORS.darkCard}CC`,
              border: `1px solid ${COLORS.primary}50`,
              borderRadius: 14,
              padding: "14px 32px",
              letterSpacing: "0.02em",
            }}
          >
            true-trucker-ifta-pro.com
          </div>
        </div>

        {/* Trust badges */}
        <div
          style={{
            opacity: badgesOpacity,
            display: "flex",
            gap: 24,
            marginTop: 36,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "🔒", text: "FMCSA Certified" },
            { icon: "✅", text: "30-day Guarantee" },
            { icon: "⚡", text: "Setup in 5 min" },
          ].map((b) => (
            <div
              key={b.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: `${COLORS.darkCard}CC`,
                border: `1px solid ${COLORS.darkBorder}`,
                borderRadius: 40,
                padding: "10px 20px",
              }}
            >
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.grayLight,
                  fontFamily: "sans-serif",
                }}
              >
                {b.text}
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
