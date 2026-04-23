import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW } from "../utils";
import { SceneBase } from "../components/SceneBase";
import { ScenePhoto } from "../components/ScenePhoto";

type Props = { durationInFrames: number };

const ChevronDown: React.FC<{ opacity: number; bounce: number }> = ({ opacity, bounce }) => (
  <svg width="80" height="50" viewBox="0 0 80 50" style={{ opacity, transform: `translateY(${bounce}px)` }}>
    <polyline points="10,10 40,40 70,10" fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Scene7CTA: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const bounce = interpolate(frame % 40, [0, 20, 40], [0, 10, 0], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const seriesOpacity = fadeIn(frame, 0, 25);
  const logoOpacity = fadeIn(frame, 5, 30);
  const lineW = expandW(frame, 22, 35);
  const mainOpacity = fadeIn(frame, 45, 28);
  const mainY = slideUp(frame, 45, 32, 60);
  const subOpacity = fadeIn(frame, 85, 25);
  const subY = slideUp(frame, 85, 28, 40);
  const ep2Opacity = fadeIn(frame, 130, 22);
  const ep2Y = slideUp(frame, 130, 25, 30);
  const chevronOpacity = fadeIn(frame, 175, 22);
  const followOpacity = fadeIn(frame, 200, 25);
  const followY = slideUp(frame, 200, 28, 30);

  // Episode dots (1 active of 6)
  const dots = [true, false, false, false, false, false];

  const audioVolume = (f: number) =>
    interpolate(f, [0, 8, durationInFrames - 20, durationInFrames - 2], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneBase bg={C.scene7bg}>
      <Audio src={staticFile("voiceover/scene7.mp3")} volume={audioVolume} />

      {/* Dramatic sunset truck photo */}
      <ScenePhoto src="scene7.jpg" frame={frame} gradientStyle="edges" kenBurns />

      {/* Brand blue top stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: `linear-gradient(to right, ${C.brandDark}, ${C.brand}, ${C.brandLight}, ${C.brand}, ${C.brandDark})`, opacity: fadeIn(frame, 0, 20), zIndex: 5 }} />

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
            alignItems: "center",
            padding: "0 72px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <Img
            src={staticFile("logo.png")}
            style={{ width: 96, height: 96, borderRadius: 20, objectFit: "cover", marginBottom: 16, opacity: logoOpacity, boxShadow: `0 0 30px ${C.brand}88` }}
          />

          <div style={{ opacity: seriesOpacity, fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: "0.22em", color: C.brandLight, marginBottom: 10 }}>
            TRUETRUCKER
          </div>

          {/* Brand divider */}
          <div style={{ width: `${lineW * 480}px`, height: 4, background: `linear-gradient(to right, ${C.brandDark}, ${C.brand}, ${C.brandLight}, ${C.brand}, ${C.brandDark})`, marginBottom: 44 }} />

          <div style={{ opacity: mainOpacity, transform: `translateY(${mainY}px)`, fontFamily: HEADING, fontWeight: 700, fontSize: 88, lineHeight: 1.08, color: C.white, letterSpacing: "-0.01em", marginBottom: 28, textShadow: "0 2px 24px rgba(0,0,0,0.9)" }}>
            THE FULL STORY STARTS NOW
          </div>

          <div style={{ opacity: subOpacity, transform: `translateY(${subY}px)`, fontFamily: BODY, fontSize: 40, lineHeight: 1.5, color: C.whiteMuted, marginBottom: 44 }}>
            Every era. Every legend. Every mile.
          </div>

          {/* Episode dots */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 36, opacity: fadeIn(frame, 115, 22) }}>
            {dots.map((active, i) => (
              <div key={i} style={{ width: active ? 30 : 10, height: 10, borderRadius: 5, backgroundColor: active ? C.brand : C.muted, opacity: active ? 1 : 0.4 }} />
            ))}
          </div>

          <div style={{ opacity: ep2Opacity, transform: `translateY(${ep2Y}px)`, fontFamily: HEADING, fontWeight: 700, fontSize: 52, color: C.gold, letterSpacing: "0.04em", marginBottom: 40 }}>
            EPISODE 2 DROPS FRIDAY
          </div>

          <ChevronDown opacity={chevronOpacity} bounce={bounce} />

          <div style={{ opacity: followOpacity, transform: `translateY(${followY}px)`, marginTop: 12, fontFamily: HEADING, fontWeight: 700, fontSize: 68, color: C.gold, letterSpacing: "-0.01em" }}>
            FOLLOW NOW
          </div>
        </div>
      </AbsoluteFill>
    </SceneBase>
  );
};
