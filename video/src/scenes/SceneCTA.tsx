import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
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
    frame: frame - 20,
    fps,
    config: { damping: 8, stiffness: 150, mass: 0.6 },
  });

  const qrOpacity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const qrScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.7 },
  });

  const urlOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const buttonPulse = 1 + 0.025 * Math.sin(frame / 8);

  const particleRadius = interpolate(frame, [0, 40], [0, 350], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const particleOpacity = interpolate(frame, [0, 40], [0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background variant="gradient" />

      {/* Audio track — drop voiceover.mp3 into video/public/ to enable */}
      {/* <Audio src={staticFile("voiceover.mp3")} /> */}

      {/* Burst rings */}
      {[1, 1.6, 2.2].map((mult, i) => (
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
            border: `2px solid ${COLORS.primary}`,
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
          padding: "40px 60px 160px",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div style={{ transform: `scale(${logoScale})`, marginBottom: 32 }}>
          <Logo size={100} delay={5} showText={true} />
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${ctaScale * buttonPulse})`,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            borderRadius: 20,
            padding: "28px 52px",
            textAlign: "center",
            boxShadow: `0 0 60px ${COLORS.primary}60, 0 20px 40px ${COLORS.primary}40`,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            TRY FREE
            <br />
            7 DAYS
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              fontFamily: "sans-serif",
              marginTop: 6,
            }}
          >
            No credit card required
          </div>
        </div>

        {/* QR Code + URL side by side */}
        <div
          style={{
            opacity: qrOpacity,
            transform: `scale(${qrScale})`,
            display: "flex",
            alignItems: "center",
            gap: 28,
            background: `${COLORS.darkCard}EE`,
            border: `2px solid ${COLORS.primary}60`,
            borderRadius: 24,
            padding: "20px 32px",
          }}
        >
          {/* QR Code */}
          <div
            style={{
              background: COLORS.dark,
              borderRadius: 16,
              padding: 10,
              border: `2px solid ${COLORS.primary}40`,
            }}
          >
            <img
              src={staticFile("qr-signup.svg")}
              width={130}
              height={130}
              style={{ display: "block" }}
            />
          </div>

          {/* Right side text */}
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: COLORS.white,
                fontFamily: "sans-serif",
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              📲 Scan the QR Code
              <br />
              <span style={{ color: COLORS.primary }}>to Start Today!</span>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.primary,
                fontFamily: "sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              true-trucker-ifta-pro.com
            </div>
            <div
              style={{
                fontSize: 18,
                color: COLORS.gray,
                fontFamily: "sans-serif",
                marginTop: 4,
              }}
            >
              /signup — FREE 7-day trial
            </div>

            {/* Mini trust badges */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              {["🔒 FMCSA Cert", "✅ 30-day Guarantee", "⚡ 5 min setup"].map(
                (b) => (
                  <span
                    key={b}
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: COLORS.grayLight,
                      fontFamily: "sans-serif",
                      background: `${COLORS.darkBorder}CC`,
                      padding: "4px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {b}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* URL text fallback */}
        <div
          style={{
            opacity: urlOpacity,
            marginTop: 20,
            fontSize: 22,
            fontWeight: 600,
            color: COLORS.gray,
            fontFamily: "sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          Or visit{" "}
          <span style={{ color: COLORS.primary, fontWeight: 800 }}>
            true-trucker-ifta-pro.com/signup
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
