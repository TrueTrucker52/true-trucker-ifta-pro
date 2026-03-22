import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const LAUNCH_COUNTER_START = 312;
const LAUNCH_COUNTER_MIN = 50;
const LAUNCH_COUNTER_SEED = new Date("2026-03-01T00:00:00Z").getTime();
const LAUNCH_COUNTER_WINDOW_MS = 1000 * 60 * 60 * 3;

const getPseudoRandomStep = (slot: number) => {
  const value = Math.sin(slot * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const getRemainingSpots = (now: number) => {
  const elapsed = Math.max(0, now - LAUNCH_COUNTER_SEED);
  const windows = Math.floor(elapsed / LAUNCH_COUNTER_WINDOW_MS);

  let claimed = 0;
  for (let slot = 0; slot < windows; slot += 1) {
    if (getPseudoRandomStep(slot) > 0.62) claimed += 1;
  }

  return Math.max(LAUNCH_COUNTER_MIN, LAUNCH_COUNTER_START - claimed);
};

const LaunchOfferBanner = () => {
  const [spotsRemaining, setSpotsRemaining] = useState(() => getRemainingSpots(Date.now()));

  useEffect(() => {
    const updateCounter = () => setSpotsRemaining(getRemainingSpots(Date.now()));
    updateCounter();

    const interval = window.setInterval(updateCounter, 1000 * 60 * 30);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <p className="text-3xl md:text-4xl font-extrabold text-secondary-foreground mb-3">
          🎉 LAUNCH SPECIAL OFFER
        </p>
        <p className="text-lg text-secondary-foreground/90 mb-2">
          Use code <span className="font-mono font-bold bg-secondary-foreground/20 px-2 py-0.5 rounded">LAUNCH20</span> at checkout for 20% off your first 3 months!
        </p>
        <p className="text-secondary-foreground/80 mb-6">
          ⏰ Offer ends when we hit 500 subscribers · <span className="font-bold text-secondary-foreground">{spotsRemaining} spots remaining</span>
        </p>
        <Button
          variant="default"
          size="lg"
          className="border-0 bg-background font-bold text-secondary shadow-lg hover:bg-background/90"
          asChild
        >
          <a href="/auth">Claim Launch Offer →</a>
        </Button>
      </div>
    </section>
  );
};

export default LaunchOfferBanner;
