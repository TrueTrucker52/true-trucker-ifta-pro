import { useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW, stamp } from "../utils";
import { SceneBase } from "../components/SceneBase";

// Retro radio wave SVG as a background decoration
const RadioWaves: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    style={{
      position: "absolute",
      right: -40,
      top: "50%",
      transform: "translateY(-50%)",
      opacity,
    }}
    width="420"
    height="420"
    viewBox="0 0 420 420"
  >
    {[60, 110, 165, 225, 290].map((r, i) => (
      <circle
        key={i}
        cx="420"
        cy="210"
        r={r}
        fill="none"
        stroke={C.gold}
        strokeWidth="2"
        opacity={0.12 - i * 0.015}
      />
    ))}
  </svg>
);

export const Scene5GoldenAge: React.FC = () => {
  const frame = useCurrentFrame();

  const waveOpacity = fadeIn(frame, 10, 40);
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

  return (
    <SceneBase bg={C.scene5bg}>
      <RadioWaves opacity={waveOpacity} />

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
        {/* Era stamp — warm amber for golden age */}
        <div
          style={{
            opacity: eraOpacity,
            transform: `scale(${eraScale})`,
            transformOrigin: "left center",
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 160,
            lineHeight: 1,
            color: C.goldLight,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          1970s–80s
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: `${lineW * 100}%`,
            height: 4,
            backgroundColor: C.gold,
            marginBottom: 36,
          }}
        />

        {/* Headline */}
        <div
          style={{
            opacity: h1Opacity,
            transform: `translateY(${h1Y}px)`,
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 82,
            lineHeight: 1.1,
            color: C.white,
            letterSpacing: "-0.01em",
            marginBottom: 40,
          }}
        >
          THE GOLDEN AGE OF TRUCKING
        </div>

        <div
          style={{
            opacity: b1Opacity,
            transform: `translateY(${b1Y}px)`,
            fontFamily: BODY,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.55,
            color: C.whiteMuted,
            marginBottom: 20,
          }}
        >
          CB radios crackled. 18-wheelers ruled the open road. Smokey & the Bandit made truckers American folk heroes.
        </div>

        <div
          style={{
            opacity: b2Opacity,
            transform: `translateY(${b2Y}px)`,
            fontFamily: BODY,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.55,
            color: C.whiteMuted,
            marginBottom: 32,
          }}
        >
          Deregulation in 1980 unlocked competition. More trucks. More routes. More freedom.
        </div>

        {/* Fact callout */}
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
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 40,
              color: C.goldLight,
              lineHeight: 1.4,
            }}
          >
            "Convoy" hit #1 on the Billboard charts in 1975. C.W. McCall made truckers legends.
          </div>
        </div>
      </div>
    </SceneBase>
  );
};
