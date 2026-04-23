import { useCurrentFrame } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW, stamp } from "../utils";
import { SceneBase } from "../components/SceneBase";

export const Scene3Wars: React.FC = () => {
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

  const statOpacity = fadeIn(frame, 170, 22);
  const statY = slideUp(frame, 170, 25, 30);

  return (
    <SceneBase bg={C.scene3bg}>
      {/* Subtle top stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: C.rust,
          opacity: fadeIn(frame, 0, 20),
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
          justifyContent: "center",
          padding: "0 80px",
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
            fontSize: 160,
            lineHeight: 1,
            color: C.rust,
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          1916–1945
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
            fontSize: 84,
            lineHeight: 1.1,
            color: C.white,
            letterSpacing: "-0.01em",
            marginBottom: 40,
          }}
        >
          WAR BUILT THE TRUCKING INDUSTRY
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
          WWI forced the military to move massive cargo across impossible terrain. Trucks stepped up — and delivered.
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
          By WWII, American factories produced over 2.4 million military trucks. Soldiers came home. Trucking never looked back.
        </div>

        {/* Stat callout */}
        <div
          style={{
            opacity: statOpacity,
            transform: `translateY(${statY}px)`,
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
            The first federal highway regulations for trucks? 1935.
          </div>
        </div>
      </div>
    </SceneBase>
  );
};
