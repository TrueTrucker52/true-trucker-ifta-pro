import { interpolate, Easing } from "remotion";

export const fadeIn = (frame: number, start = 0, dur = 20) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

export const slideUp = (frame: number, start = 0, dur = 25, dist = 50) =>
  interpolate(frame, [start, start + dur], [dist, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

export const slideFromLeft = (frame: number, start = 0, dur = 25, dist = 150) =>
  interpolate(frame, [start, start + dur], [-dist, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

export const expandW = (frame: number, start = 0, dur = 30) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

export const stamp = (frame: number, start = 0, dur = 18) =>
  interpolate(frame, [start, start + dur], [1.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

export const countUp = (frame: number, start: number, dur: number, to: number) =>
  interpolate(frame, [start, start + dur], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
