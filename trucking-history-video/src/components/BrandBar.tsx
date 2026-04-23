import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../colors";
import { BODY } from "../fonts";

type Props = {
  episode?: string;
};

// Top bar: TrueTrucker logo left + series title right
// Bottom bar: episode label centred
export const BrandBar: React.FC<Props> = ({ episode = "EP. 1" }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* ── Top brand bar ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 52px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)",
          opacity,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Img
            src={staticFile("logo.png")}
            style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover" }}
          />
          <div>
            <div
              style={{
                fontFamily: BODY,
                fontWeight: 700,
                fontSize: 28,
                color: C.white,
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              TrueTrucker
            </div>
            <div
              style={{
                fontFamily: BODY,
                fontWeight: 400,
                fontSize: 18,
                color: C.brandLight,
                letterSpacing: "0.06em",
              }}
            >
              IFTA Pro
            </div>
          </div>
        </div>

        {/* Series pill */}
        <div
          style={{
            backgroundColor: C.brand,
            borderRadius: 30,
            padding: "8px 22px",
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 20,
            color: C.white,
            letterSpacing: "0.08em",
          }}
        >
          {episode}
        </div>
      </div>

      {/* ── Bottom series label ───────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: BODY,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: C.muted,
          opacity,
          zIndex: 10,
        }}
      >
        HISTORY OF TRUCKING &nbsp;•&nbsp; {episode}
      </div>

      {/* ── Brand accent line (bottom) ────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 5,
          background: `linear-gradient(to right, ${C.brandDark}, ${C.brand}, ${C.brandLight}, ${C.brand}, ${C.brandDark})`,
          opacity,
          zIndex: 10,
        }}
      />
    </>
  );
};
