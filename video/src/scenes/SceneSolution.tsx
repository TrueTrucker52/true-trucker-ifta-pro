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

export const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
  });

  const textOpacity = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [40, 65], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [80, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [175, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ring pulse animation
  const ringScale1 = 1 + interpolate(frame % 60, [0, 60], [0, 0.5]);
  const ringOpacity1 = interpolate(frame % 60, [0, 60], [0.4, 0]);
  const ringScale2 = 1 + interpolate((frame + 20) % 60, [0, 60], [0, 0.5]);
  const ringOpacity2 = interpolate((frame + 20) % 60, [0, 60], [0.4, 0]);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background variant="orange" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          padding: "0 60px",
        }}
      >
        {/* Pulsing rings behind logo */}
        <div
          style={{
            position: "relative",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 200,
              height: 200,
              marginTop: -100,
              marginLeft: -100,
              borderRadius: "50%",
              border: `2px solid ${COLORS.primary}`,
              transform: `scale(${ringScale1})`,
              opacity: ringOpacity1,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 200,
              height: 200,
              marginTop: -100,
              marginLeft: -100,
              borderRadius: "50%",
              border: `2px solid ${COLORS.primary}`,
              transform: `scale(${ringScale2})`,
              opacity: ringOpacity2,
            }}
          />
          <div style={{ transform: `scale(${logoScale})` }}>
            <Logo size={140} delay={10} showText={false} />
          </div>
        </div>

        {/* Introducing text */}
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: COLORS.gray,
              fontFamily: "sans-serif",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Introducing
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}
          >
            TRUE
            <span style={{ color: COLORS.primary }}>TRUCKER</span>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.white,
              fontFamily: "sans-serif",
              letterSpacing: "0.05em",
              marginTop: 4,
            }}
          >
            IFTA PRO
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            marginTop: 48,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: COLORS.grayLight,
              fontFamily: "sans-serif",
              lineHeight: 1.45,
            }}
          >
            File IFTA in{" "}
            <span
              style={{
                color: COLORS.primary,
                fontWeight: 800,
              }}
            >
              10 minutes.
            </span>
            <br />
            Not 4 hours.
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            opacity: taglineOpacity,
            marginTop: 44,
            background: `${COLORS.primary}22`,
            border: `1px solid ${COLORS.primary}60`,
            borderRadius: 50,
            padding: "14px 36px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.primary,
              fontFamily: "sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            #1 IFTA App for Truckers
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
