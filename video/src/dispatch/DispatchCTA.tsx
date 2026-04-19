import React from "react";
import { AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../colors";

export const DispatchCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame: frame - 5, fps, config: { damping: 10, stiffness: 120, mass: 0.8 } });
  const btnScale = spring({ frame: frame - 20, fps, config: { damping: 8, stiffness: 150, mass: 0.6 } });
  const qrScale = spring({ frame: frame - 50, fps, config: { damping: 12, stiffness: 130, mass: 0.7 } });
  const qrOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const urlOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnPulse = 1 + 0.025 * Math.sin(frame / 8);

  const burst = interpolate(frame, [0, 40], [0, 350], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const burstOp = interpolate(frame, [0, 40], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #3d1800 0%, #0A0A0F 70%)" }}>
      {[1, 1.6, 2.2].map((m, i) => (
        <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: burst * m * 2, height: burst * m * 2, marginTop: -(burst * m), marginLeft: -(burst * m), borderRadius: "50%", border: `2px solid ${COLORS.primary}`, opacity: burstOp / m }} />
      ))}

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 60px 160px", gap: 0 }}>
        {/* Heading */}
        <div style={{ transform: `scale(${titleScale})`, textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.gray, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Ready to earn more?</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.0, letterSpacing: "-0.03em", marginTop: 8 }}>
            APPLY<br /><span style={{ color: COLORS.primary }}>NOW</span>
          </div>
        </div>

        {/* Apply button */}
        <div style={{ transform: `scale(${btnScale * btnPulse})`, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, borderRadius: 20, padding: "28px 52px", textAlign: "center", boxShadow: `0 0 60px ${COLORS.primary}60, 0 20px 40px ${COLORS.primary}40`, marginBottom: 36 }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            GET DISPATCHED<br />TODAY
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif", marginTop: 8 }}>
            $0 upfront · No contracts
          </div>
        </div>

        {/* QR + URL */}
        <div style={{ opacity: qrOpacity, transform: `scale(${qrScale})`, display: "flex", alignItems: "center", gap: 28, background: `${COLORS.darkCard}EE`, border: `2px solid ${COLORS.primary}60`, borderRadius: 24, padding: "20px 32px" }}>
          <div style={{ background: COLORS.dark, borderRadius: 16, padding: 10, border: `2px solid ${COLORS.primary}40` }}>
            <img src={staticFile("qr-dispatch.svg")} width={130} height={130} style={{ display: "block" }} />
          </div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white, fontFamily: "sans-serif", lineHeight: 1.15, marginBottom: 10 }}>
              📲 Scan the QR Code<br /><span style={{ color: COLORS.primary }}>to Apply Today!</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary, fontFamily: "sans-serif" }}>partner.truetruckingtv.com</div>
            <div style={{ fontSize: 16, color: COLORS.gray, fontFamily: "sans-serif", marginTop: 4 }}>/partner-application</div>
          </div>
        </div>

        <div style={{ opacity: urlOpacity, marginTop: 20, fontSize: 20, fontWeight: 600, color: COLORS.gray, fontFamily: "sans-serif", textAlign: "center" }}>
          Or visit <span style={{ color: COLORS.primary, fontWeight: 800 }}>partner.truetruckingtv.com/partner-application</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
