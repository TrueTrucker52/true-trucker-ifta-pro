import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW, stamp } from "../utils";
import { SceneBase } from "../components/SceneBase";
import { ScenePhoto } from "../components/ScenePhoto";

type Props = { durationInFrames: number };

export const Scene5GoldenAge: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const eraOpacity = fadeIn(frame, 0, 18);
  const eraScale = stamp(frame, 0, 18);
  const lineW = expandW(frame, 22, 30);
  const h1Opacity = fadeIn(frame, 55, 22);
  const h1Y = slideUp(frame, 55, 28, 50);
  const b1Opacity = fadeIn(frame, 90, 22);
  const b1Y = slideUp(frame, 90, 25, 30);
  const b2Opacity = fadeIn(frame, 130, 22);
  const b2Y = slideUp(frame, 130, 25, 30);
  const factOpacity = fadeIn(frame, 168, 22);
  const factY = slideUp(frame, 168, 25, 30);

  const audioVolume = (f: number) =>
    interpolate(f, [0, 8, durationInFrames - 20, durationInFrames - 2], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneBase bg={C.scene5bg}>
      <Audio src={staticFile("voiceover/scene5.mp3")} volume={audioVolume} />

      {/* Classic chrome 18-wheeler on open road */}
      <ScenePhoto src="scene5.jpg" frame={frame} gradientStyle="bottom-heavy" kenBurns />

      {/* Warm amber tint overlay — golden age feel */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, rgba(40,20,0,0.30) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

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
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          <div style={{ opacity: eraOpacity, transform: `scale(${eraScale})`, transformOrigin: "left center", fontFamily: HEADING, fontWeight: 700, fontSize: 148, lineHeight: 1, color: C.goldLight, letterSpacing: "-0.03em", marginBottom: 4, textShadow: "0 4px 24px rgba(0,0,0,0.9)" }}>
            1970s–80s
          </div>

          <div style={{ width: `${lineW * 100}%`, height: 4, background: `linear-gradient(to right, ${C.brand}, ${C.brandLight})`, marginBottom: 32 }} />

          <div style={{ opacity: h1Opacity, transform: `translateY(${h1Y}px)`, fontFamily: HEADING, fontWeight: 700, fontSize: 78, lineHeight: 1.1, color: C.white, letterSpacing: "-0.01em", marginBottom: 36, textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>
            THE GOLDEN AGE OF TRUCKING
          </div>

          <div style={{ opacity: b1Opacity, transform: `translateY(${b1Y}px)`, fontFamily: BODY, fontSize: 42, lineHeight: 1.55, color: C.whiteMuted, marginBottom: 18, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            CB radios crackled. 18-wheelers ruled the open road. Smokey & the Bandit made truckers folk heroes.
          </div>

          <div style={{ opacity: b2Opacity, transform: `translateY(${b2Y}px)`, fontFamily: BODY, fontSize: 42, lineHeight: 1.55, color: C.whiteMuted, marginBottom: 28, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            Deregulation in 1980 unlocked competition. More trucks. More routes. More freedom.
          </div>

          <div style={{ opacity: factOpacity, transform: `translateY(${factY}px)`, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 5, height: 56, backgroundColor: C.rust, flexShrink: 0 }} />
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 38, color: C.goldLight, lineHeight: 1.4 }}>
              "Convoy" hit #1 on the Billboard charts in 1975.
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneBase>
  );
};
