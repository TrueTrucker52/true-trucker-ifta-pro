import { useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW } from "../utils";
import { SceneBase } from "../components/SceneBase";

const hooks = [
  { text: "BEFORE AMAZON.", startFrame: 5 },
  { text: "BEFORE WALMART.", startFrame: 25 },
  { text: "BEFORE GPS.", startFrame: 45 },
];

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // Gold accent line sweeps in after hook lines
  const lineScale = expandW(frame, 70, 30);

  // Main declaration
  const mainOpacity = fadeIn(frame, 100, 30);
  const mainY = slideUp(frame, 100, 35, 60);

  // Sub-note
  const subOpacity = fadeIn(frame, 145, 25);

  return (
    <SceneBase bg={C.scene1bg}>
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
        {/* Hook lines */}
        <div style={{ marginBottom: 56 }}>
          {hooks.map(({ text, startFrame }, i) => (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame, startFrame, 15),
                transform: `translateY(${slideUp(frame, startFrame, 22, 45)}px)`,
                fontFamily: HEADING,
                fontWeight: 700,
                fontSize: 100,
                lineHeight: 1.1,
                color: C.white,
                letterSpacing: "-0.01em",
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Sweeping gold divider */}
        <div
          style={{
            width: `${lineScale * 100}%`,
            height: 5,
            backgroundColor: C.gold,
            marginBottom: 56,
          }}
        />

        {/* Main statement */}
        <div
          style={{
            opacity: mainOpacity,
            transform: `translateY(${mainY}px)`,
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 76,
            lineHeight: 1.2,
            color: C.gold,
            letterSpacing: "-0.01em",
          }}
        >
          EVERYTHING YOU OWN ARRIVED ON A TRUCK.
        </div>

        {/* Subtext */}
        <div
          style={{
            marginTop: 40,
            opacity: subOpacity,
            fontFamily: BODY,
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 1.5,
            color: C.whiteMuted,
          }}
        >
          The story of how 18 wheels changed civilization starts here.
        </div>
      </div>
    </SceneBase>
  );
};
