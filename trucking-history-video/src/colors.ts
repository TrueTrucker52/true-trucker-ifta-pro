// TrueTrucker brand + documentary palette
export const C = {
  // ── TrueTrucker brand ──────────────────────────────────────
  brand: "#0066CC",       // Electric trucker blue (primary)
  brandLight: "#3399FF",  // Lighter blue for glows
  brandDark: "#004499",   // Deep navy blue

  // ── Documentary palette ────────────────────────────────────
  bg: "#080C14",
  gold: "#F5A623",
  goldLight: "#FFD166",
  goldDark: "#C4820F",
  rust: "#C73B0A",
  white: "#F5F0EB",
  whiteMuted: "#B8C5D0",
  muted: "#5A6E7D",

  // ── Per-scene background tints (fallback when photo absent) ─
  scene1bg: "#080C14",
  scene2bg: "#120E08",
  scene3bg: "#0A100A",
  scene4bg: "#080E1A",
  scene5bg: "#130B05",
  scene6bg: "#060C14",
  scene7bg: "#08080E",
} as const;
