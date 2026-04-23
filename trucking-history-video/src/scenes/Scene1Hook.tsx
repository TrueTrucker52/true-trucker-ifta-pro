import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW } from "../utils";
import { SceneBase } from "../components/SceneBase";
import { ScenePhoto } from "../components/ScenePhoto";

type Props = { durationInFrames: number };

const hooks = [
  { text: "BEFORE AMAZON.", startFrame: 8 },
  { text: "BEFORE WALMART.", startFrame: 28 },
  { text: "BEFORE GPS.", startFrame: 48 },
];

export const Scene1Hook: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const lineScale = expandW(frame, 72, 30);
  const mainOpacity = fadeIn(frame, 102, 28);
  const mainY = slideUp(frame, 102, 32, 55);
  const subOpacity = fadeIn(frame, 148, 25);

  const audioVolume = (f: number) =>
    interpolate(f, [0, 8, durationInFrames - 20, durationInFrames - 2], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <SceneBase bg={C.scene1bg}>
      <Audio src={staticFile("voiceover/scene1.mp3")} volume={audioVolume} />

      {/* Background photo — night highway, dramatic */}
      <ScenePhoto src="scene1.jpg" frame={frame} gradientStyle="bottom-heavy" />

      {/* Content — positioned in lower 60% so photo shows above */}
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: 0,
            right: 0,
            bottom: 130,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          {/* Hook lines */}
          <div style={{ marginBottom: 48 }}>
            {hooks.map(({ text, startFrame }, i) => (
              <div
                key={i}
                style={{
                  opacity: fadeIn(frame, startFrame, 15),
                  transform: `translateY(${slideUp(frame, startFrame, 20, 40)}px)`,
                  fontFamily: HEADING,
                  fontWeight: 700,
                  fontSize: 96,
                  lineHeight: 1.08,
                  color: C.white,
                  letterSpacing: "-0.01em",
                  textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                }}
              >
                {text}
              </div>
            ))}
          </div>

          {/* Brand blue sweep line */}
          <div
            style={{
              width: `${lineScale * 100}%`,
              height: 5,
              background: `linear-gradient(to right, ${C.brand}, ${C.brandLight})`,
              marginBottom: 48,
              boxShadow: `0 0 20px ${C.brandLight}88`,
            }}
          />

          {/* Main statement */}
          <div
            style={{
              opacity: mainOpacity,
              transform: `translateY(${mainY}px)`,
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 72,
              lineHeight: 1.2,
              color: C.gold,
              letterSpacing: "-0.01em",
              textShadow: "0 2px 24px rgba(0,0,0,0.9)",
            }}
          >
            EVERYTHING YOU OWN ARRIVED ON A TRUCK.
          </div>

          <div
            style={{
              marginTop: 36,
              opacity: subOpacity,
              fontFamily: BODY,
              fontSize: 38,
              lineHeight: 1.5,
              color: C.whiteMuted,
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            }}
          >
            The story of how 18 wheels changed civilization starts here.
          </div>
        </div>
      </AbsoluteFill>
    </SceneBase>
  );
};
