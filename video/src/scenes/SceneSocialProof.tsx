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

const testimonials = [
  {
    text: '"I used to spend 4 hours on IFTA every quarter. Now it\'s 10 minutes. Game changer!"',
    name: "Mike J.",
    location: "Texas",
    delay: 60,
  },
  {
    text: '"Avoided a $2,400 fine because TrueTrucker caught my mileage error. Worth every penny."',
    name: "Carlos R.",
    location: "Georgia",
    delay: 130,
  },
];

const Stars: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ display: "flex", gap: 6, opacity }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const starOpacity = interpolate(frame - delay - i * 6, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              fontSize: 36,
              opacity: starOpacity,
              filter: `drop-shadow(0 0 6px ${COLORS.yellow})`,
            }}
          >
            ⭐
          </div>
        );
      })}
    </div>
  );
};

const TestimonialCard: React.FC<{
  text: string;
  name: string;
  location: string;
  delay: number;
}> = ({ text, name, location, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(progress, [0, 1], [100, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        background: `${COLORS.darkCard}DD`,
        border: `1px solid ${COLORS.primary}30`,
        borderRadius: 24,
        padding: "32px 36px",
      }}
    >
      <Stars delay={delay + 10} />
      <div
        style={{
          fontSize: 26,
          fontWeight: 500,
          color: COLORS.grayLight,
          fontFamily: "sans-serif",
          lineHeight: 1.5,
          marginTop: 16,
          fontStyle: "italic",
        }}
      >
        {text}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: COLORS.primary,
          fontFamily: "sans-serif",
          marginTop: 16,
        }}
      >
        — {name},{" "}
        <span style={{ color: COLORS.gray, fontWeight: 400 }}>{location}</span>
      </div>
    </div>
  );
};

export const SceneSocialProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const statScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 130, mass: 0.7 },
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitOpacity = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <Background variant="gradient" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 60px",
          gap: 32,
        }}
      >
        {/* Headline */}
        <div style={{ opacity: titleOpacity }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.primary,
              fontFamily: "sans-serif",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Trusted by truckers
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: COLORS.white,
              fontFamily: "sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: 6,
            }}
          >
            500+
            <br />
            <span style={{ color: COLORS.primary }}>Happy</span>
            <br />
            Truckers
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 20,
            transform: `scale(${statScale})`,
          }}
        >
          {[
            { value: "4.9★", label: "Rating" },
            { value: "50+", label: "Reviews" },
            { value: "30-day", label: "Guarantee" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: `${COLORS.primary}18`,
                border: `1px solid ${COLORS.primary}40`,
                borderRadius: 16,
                padding: "18px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: COLORS.primary,
                  fontFamily: "sans-serif",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: COLORS.gray,
                  fontFamily: "sans-serif",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
