import { Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW, stamp } from "../utils";
import { SceneBase } from "../components/SceneBase";

type Props = { durationInFrames: number };

export const Scene2FirstTruck: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const eraOpacity = fadeIn(frame, 0, 20);
  const eraScale = stamp(frame, 0, 20);
  const lineW = expandW(frame, 22, 30);
  const h1Opacity = fadeIn(frame, 55, 22);
  const h1Y = slideUp(frame, 55, 28, 50);
  const body1Opacity = fadeIn(frame, 90, 22);
  const body1Y = slideUp(frame, 90, 25, 30);
  const body2Opacity = fadeIn(frame, 130, 22);
  const body2Y = slideUp(frame, 130, 25, 30);
  const factOpacity = fadeIn(frame, 175, 22);
  const factY = slideUp(frame, 175, 25, 30);

  const audioVolume = (f: number) =>
    interpolate(
      f,
      [0, 8, durationInFrames - 20, durationInFrames - 2],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

  return (
    <SceneBase bg={C.scene2bg}>
      <Audio src={staticFile("voiceover/scene2.mp3")} volume={audioVolume} />

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
        <div
          style={{
            opacity: eraOpacity,
            transform: `scale(${eraScale})`,
            transformOrigin: "left center",
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 220,
            lineHeight: 1,
            color: C.gold,
            letterSpacing: "-0.04em",
            marginBottom: 8,
          }}
        >
          1896
        </div>

        <div style={{ width: `${lineW * 100}%`, height: 4, backgroundColor: C.gold, marginBottom: 36 }} />

        <div
          style={{
            opacity: h1Opacity,
            transform: `translateY(${h1Y}px)`,
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 88,
            lineHeight: 1.1,
            color: C.white,
            letterSpacing: "-0.01em",
            marginBottom: 40,
          }}
        >
          THE FIRST MOTOR TRUCK
        </div>

        <div
          style={{
            opacity: body1Opacity,
            transform: `translateY(${body1Y}px)`,
            fontFamily: BODY,
            fontSize: 44,
            lineHeight: 1.55,
            color: C.whiteMuted,
            marginBottom: 20,
          }}
        >
          Gottlieb Daimler unveiled a purpose-built motor truck in Germany — powered by a 2-cylinder engine.
        </div>

        <div
          style={{
            opacity: body2Opacity,
            transform: `translateY(${body2Y}px)`,
            fontFamily: BODY,
            fontSize: 44,
            lineHeight: 1.55,
            color: C.whiteMuted,
            marginBottom: 32,
          }}
        >
          4 horsepower. 10 mph. The world would never move the same way again.
        </div>

        <div
          style={{
            opacity: factOpacity,
            transform: `translateY(${factY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ width: 6, height: 60, backgroundColor: C.rust, flexShrink: 0 }} />
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 40, color: C.gold, lineHeight: 1.4 }}>
            Mack Brothers followed in 1900. An American icon was born.
          </div>
        </div>
      </div>
    </SceneBase>
  );
};
