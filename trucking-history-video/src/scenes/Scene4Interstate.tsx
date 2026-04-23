import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW, stamp } from "../utils";
import { SceneBase } from "../components/SceneBase";
import { ScenePhoto } from "../components/ScenePhoto";

type Props = { durationInFrames: number };

export const Scene4Interstate: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const eraOpacity = fadeIn(frame, 0, 18);
  const eraScale = stamp(frame, 0, 18);
  const lineW = expandW(frame, 20, 30);
  const h1Opacity = fadeIn(frame, 52, 22);
  const h1Y = slideUp(frame, 52, 28, 50);
  const b1Opacity = fadeIn(frame, 88, 22);
  const b1Y = slideUp(frame, 88, 25, 30);
  const b2Opacity = fadeIn(frame, 130, 22);
  const b2Y = slideUp(frame, 130, 25, 30);
  const factOpacity = fadeIn(frame, 175, 22);
  const factY = slideUp(frame, 175, 25, 30);

  const audioVolume = (f: number) =>
    interpolate(f, [0, 8, durationInFrames - 20, durationInFrames - 2], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneBase bg={C.scene4bg}>
      <Audio src={staticFile("voiceover/scene4.mp3")} volume={audioVolume} />

      {/* Aerial highway photo */}
      <ScenePhoto src="scene4.jpg" frame={frame} gradientStyle="top-heavy" kenBurns />

      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 130,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "120px 72px 0",
          }}
        >
          <div style={{ opacity: eraOpacity, transform: `scale(${eraScale})`, transformOrigin: "left center", fontFamily: HEADING, fontWeight: 700, fontSize: 210, lineHeight: 1, color: C.gold, letterSpacing: "-0.04em", marginBottom: 4, textShadow: "0 4px 32px rgba(0,0,0,0.9)" }}>
            1956
          </div>

          <div style={{ width: `${lineW * 100}%`, height: 4, background: `linear-gradient(to right, ${C.brand}, ${C.brandLight})`, marginBottom: 32 }} />

          <div style={{ opacity: h1Opacity, transform: `translateY(${h1Y}px)`, fontFamily: HEADING, fontWeight: 700, fontSize: 78, lineHeight: 1.1, color: C.white, letterSpacing: "-0.01em", marginBottom: 36, textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>
            EISENHOWER'S HIGHWAY ACT
          </div>

          <div style={{ opacity: b1Opacity, transform: `translateY(${b1Y}px)`, fontFamily: BODY, fontSize: 42, lineHeight: 1.55, color: C.whiteMuted, marginBottom: 18, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            41,000 miles of interstate highway, built in a single act of Congress.
          </div>

          <div style={{ opacity: b2Opacity, transform: `translateY(${b2Y}px)`, fontFamily: BODY, fontSize: 42, lineHeight: 1.55, color: C.whiteMuted, marginBottom: 28, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            Overnight, a truck could drive coast to coast without hitting a single stoplight.
          </div>

          <div style={{ opacity: factOpacity, transform: `translateY(${factY}px)`, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 5, height: 56, background: `linear-gradient(to bottom, ${C.brand}, ${C.brandLight})`, flexShrink: 0 }} />
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 38, color: C.gold, lineHeight: 1.4 }}>
              Trucking revenue doubled within a decade of the Act passing.
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneBase>
  );
};
