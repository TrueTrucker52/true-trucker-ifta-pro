import { useCurrentFrame, interpolate, Easing } from "remotion";
import { C } from "../colors";
import { HEADING, BODY } from "../fonts";
import { fadeIn, slideUp, expandW } from "../utils";
import { SceneBase } from "../components/SceneBase";

// Animated chevron pointing down
const ChevronDown: React.FC<{ opacity: number; bounce: number }> = ({
  opacity,
  bounce,
}) => (
  <svg
    width="80"
    height="50"
    viewBox="0 0 80 50"
    style={{ opacity, transform: `translateY(${bounce}px)` }}
  >
    <polyline
      points="10,10 40,40 70,10"
      fill="none"
      stroke={C.gold}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Episode dot indicators
const EpisodeDots: React.FC<{ opacity: number; active: number; total: number }> = ({
  opacity,
  active,
  total,
}) => (
  <div
    style={{
      display: "flex",
      gap: 14,
      alignItems: "center",
      opacity,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === active ? 32 : 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: i === active ? C.gold : C.muted,
          opacity: i === active ? 1 : 0.4,
        }}
      />
    ))}
  </div>
);

export const Scene7CTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Bouncing chevron animation
  const bounce = interpolate(
    frame % 40,
    [0, 20, 40],
    [0, 10, 0],
    {
      easing: Easing.inOut(Easing.sin),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const seriesOpacity = fadeIn(frame, 0, 25);
  const lineW = expandW(frame, 22, 35);
  const mainOpacity = fadeIn(frame, 45, 28);
  const mainY = slideUp(frame, 45, 32, 60);
  const subOpacity = fadeIn(frame, 85, 25);
  const subY = slideUp(frame, 85, 28, 40);
  const dotsOpacity = fadeIn(frame, 125, 22);
  const ep2Opacity = fadeIn(frame, 145, 22);
  const ep2Y = slideUp(frame, 145, 25, 30);
  const chevronOpacity = fadeIn(frame, 185, 22);
  const followOpacity = fadeIn(frame, 210, 25);
  const followY = slideUp(frame, 210, 28, 30);

  return (
    <SceneBase bg={C.scene7bg}>
      {/* Top gold accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: C.gold,
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
          alignItems: "center",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Series name */}
        <div
          style={{
            opacity: seriesOpacity,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: "0.25em",
            color: C.muted,
            marginBottom: 12,
          }}
        >
          HISTORY OF TRUCKING
        </div>

        {/* Gold line */}
        <div
          style={{
            width: `${lineW * 520}px`,
            height: 4,
            backgroundColor: C.gold,
            marginBottom: 48,
          }}
        />

        {/* Main CTA headline */}
        <div
          style={{
            opacity: mainOpacity,
            transform: `translateY(${mainY}px)`,
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.08,
            color: C.white,
            letterSpacing: "-0.01em",
            marginBottom: 32,
          }}
        >
          THE FULL STORY STARTS NOW
        </div>

        {/* Sub headline */}
        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            fontFamily: BODY,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.5,
            color: C.whiteMuted,
            marginBottom: 52,
          }}
        >
          We're just getting started. Every era. Every legend. Every mile.
        </div>

        {/* Episode progress dots */}
        <div style={{ marginBottom: 36, opacity: dotsOpacity }}>
          <EpisodeDots opacity={1} active={0} total={6} />
        </div>

        {/* Episode 2 teaser */}
        <div
          style={{
            opacity: ep2Opacity,
            transform: `translateY(${ep2Y}px)`,
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 56,
            color: C.gold,
            letterSpacing: "0.04em",
            marginBottom: 48,
          }}
        >
          EPISODE 2 DROPS FRIDAY
        </div>

        {/* Chevron */}
        <div style={{ marginBottom: 20 }}>
          <ChevronDown opacity={chevronOpacity} bounce={bounce} />
        </div>

        {/* Follow CTA */}
        <div
          style={{
            opacity: followOpacity,
            transform: `translateY(${followY}px)`,
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 72,
            color: C.gold,
            letterSpacing: "-0.01em",
          }}
        >
          FOLLOW NOW
        </div>
      </div>
    </SceneBase>
  );
};
