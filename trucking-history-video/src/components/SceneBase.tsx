import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { BODY } from "../fonts";
import { fadeIn } from "../utils";

type Props = {
  bg?: string;
  children: React.ReactNode;
  episode?: string;
};

export const SceneBase: React.FC<Props> = ({
  bg = C.bg,
  children,
  episode = "EP. 1",
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {/* Radial vignette overlay */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {children}

      {/* Bottom series branding */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: BODY,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "0.22em",
          color: C.muted,
          opacity: fadeIn(frame, 20, 25),
        }}
      >
        HISTORY OF TRUCKING &nbsp;•&nbsp; {episode}
      </div>
    </AbsoluteFill>
  );
};
