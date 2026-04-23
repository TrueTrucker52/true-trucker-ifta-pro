import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Easing } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW } from "../utils";
import { SceneBase } from "../components/SceneBase";

type Props = { durationInFrames: number };

type StatProps = {
  frame: number;
  startFrame: number;
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  color?: string;
};

const Stat: React.FC<StatProps> = ({ frame, startFrame, value, decimals, suffix, label, color = C.gold }) => {
  const count = interpolate(frame, [startFrame, startFrame + 55], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = fadeIn(frame, startFrame, 20);
  const y = slideUp(frame, startFrame, 25, 40);
  const barW = interpolate(frame, [startFrame, startFrame + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });

  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString();

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, marginBottom: 48 }}>
      <div style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 120, lineHeight: 1, color, letterSpacing: "-0.03em" }}>
        {display}{suffix}
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 38, color: C.whiteMuted, letterSpacing: "0.08em", marginTop: 6, marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ width: `${barW * 240}px`, height: 3, backgroundColor: color, opacity: 0.5 }} />
    </div>
  );
};

export const Scene6Today: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const headerOpacity = fadeIn(frame, 0, 20);
  const lineW = expandW(frame, 15, 30);

  const audioVolume = (f: number) =>
    interpolate(
      f,
      [0, 8, durationInFrames - 20, durationInFrames - 2],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  return (
    <SceneBase bg={C.scene6bg}>
      <Audio src={staticFile("voiceover/scene6.mp3")} volume={audioVolume} />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 160,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        <div style={{ opacity: headerOpacity, fontFamily: HEADING, fontWeight: 700, fontSize: 80, lineHeight: 1, color: C.muted, letterSpacing: "0.12em", marginBottom: 8 }}>
          TODAY
        </div>

        <div style={{ width: `${lineW * 100}%`, height: 4, backgroundColor: C.gold, marginBottom: 56 }} />

        <Stat frame={frame} startFrame={35} value={3.5} decimals={1} suffix="M" label="PROFESSIONAL TRUCK DRIVERS" color={C.gold} />
        <Stat frame={frame} startFrame={80} value={70} decimals={0} suffix="%" label="OF ALL US FREIGHT MOVES BY TRUCK" color={C.goldLight} />
        <Stat frame={frame} startFrame={128} value={940} decimals={0} suffix="B" label="DOLLAR TRUCKING INDUSTRY" color={C.rust} />
      </div>
    </SceneBase>
  );
};
