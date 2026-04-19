import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Props {
  text: string;
  delay?: number;
  style?: React.CSSProperties;
  direction?: "up" | "left" | "right";
}

export const AnimatedText: React.FC<Props> = ({
  text,
  delay = 0,
  style = {},
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY =
    direction === "up" ? interpolate(progress, [0, 1], [40, 0]) : 0;
  const translateX =
    direction === "left"
      ? interpolate(progress, [0, 1], [-60, 0])
      : direction === "right"
        ? interpolate(progress, [0, 1], [60, 0])
        : 0;

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${translateY}px) translateX(${translateX}px)`,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
