import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";

type Props = {
  src: string;           // filename inside public/photos/
  frame: number;
  // Optional Ken Burns effect: subtle slow zoom
  kenBurns?: boolean;
  // Gradient style controls overlay darkness per scene
  gradientStyle?: "top-heavy" | "bottom-heavy" | "even" | "edges";
};

export const ScenePhoto: React.FC<Props> = ({
  src,
  frame,
  kenBurns = true,
  gradientStyle = "bottom-heavy",
}) => {
  // Slow Ken Burns zoom: 100% → 108% over 600 frames
  const scale = kenBurns
    ? interpolate(frame, [0, 600], [1.0, 1.08], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const photoOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gradients: Record<string, string> = {
    "top-heavy":
      "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.92) 100%)",
    "bottom-heavy":
      "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.95) 100%)",
    even: "rgba(0,0,0,0.60)",
    edges:
      "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.30) 25%, rgba(0,0,0,0.30) 75%, rgba(0,0,0,0.85) 100%)",
  };

  return (
    <>
      {/* Photo layer */}
      <AbsoluteFill style={{ opacity: photoOpacity, overflow: "hidden" }}>
        <Img
          src={staticFile(`photos/${src}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </AbsoluteFill>

      {/* Gradient overlay — ensures text is always readable */}
      <AbsoluteFill
        style={{
          background: gradients[gradientStyle],
          pointerEvents: "none",
        }}
      />
    </>
  );
};
