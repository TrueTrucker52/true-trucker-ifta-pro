import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW, stamp } from "../utils";
import { SceneBase } from "../components/SceneBase";

// Perspective road drawn as SVG vanishing lines
const RoadGraphic: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 480,
      opacity,
    }}
    viewBox="0 0 1080 480"
    preserveAspectRatio="none"
  >
    {/* Road surface */}
    <polygon points="540,0 0,480 1080,480" fill="rgba(20,30,50,0.8)" />
    {/* Road edges */}
    <line x1="540" y1="0" x2="0" y2="480" stroke={C.gold} strokeWidth="3" opacity="0.6" />
    <line x1="540" y1="0" x2="1080" y2="480" stroke={C.gold} strokeWidth="3" opacity="0.6" />
    {/* Center dashes — static perspective dashes */}
    {[60, 130, 210, 300, 400].map((y, i) => {
      const pct = y / 480;
      const w = pct * 80;
      const x = 540 - w / 2;
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={pct * 14}
          fill={C.goldLight}
          opacity={0.7}
        />
      );
    })}
    {/* Mile markers on sides */}
    <rect x="120" y="440" width="60" height="6" fill={C.white} opacity="0.3" />
    <rect x="900" y="440" width="60" height="6" fill={C.white} opacity="0.3" />
  </svg>
);

export const Scene4Interstate: React.FC = () => {
  const frame = useCurrentFrame();

  const roadOpacity = fadeIn(frame, 0, 40);
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

  return (
    <SceneBase bg={C.scene4bg}>
      {/* Road graphic at bottom */}
      <RoadGraphic opacity={roadOpacity} />

      {/* Dark gradient over road so text stays readable */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, transparent 55%, rgba(8,14,26,0.92) 75%, #080E1A 90%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 160,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "120px 80px 0",
        }}
      >
        {/* Era stamp */}
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
          1956
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
          EISENHOWER'S HIGHWAY ACT
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
          41,000 miles of interstate highway, built in a single act of Congress.
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
          Overnight, a truck could drive coast to coast without hitting a single stoplight.
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
          <div style={{ width: 6, height: 60, backgroundColor: C.gold, flexShrink: 0 }} />
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 40,
              color: C.gold,
              lineHeight: 1.4,
            }}
          >
            Trucking revenue doubled within a decade of the Act passing.
          </div>
        </div>
      </div>
    </SceneBase>
  );
};
