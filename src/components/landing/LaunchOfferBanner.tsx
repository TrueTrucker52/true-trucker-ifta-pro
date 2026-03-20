import { Button } from "@/components/ui/button";

const LaunchOfferBanner = () => (
  <section className="bg-secondary py-12 md:py-16">
    <div className="container mx-auto px-4 text-center">
      <p className="text-3xl md:text-4xl font-extrabold text-secondary-foreground mb-3">
        🎉 LAUNCH SPECIAL OFFER
      </p>
      <p className="text-lg text-secondary-foreground/90 mb-2">
        Use code <span className="font-mono font-bold bg-secondary-foreground/20 px-2 py-0.5 rounded">LAUNCH20</span> at checkout for 20% off your first 3 months!
      </p>
      <p className="text-secondary-foreground/80 mb-6">
        ⏰ Offer ends when we hit 500 subscribers · <span className="font-bold">312 spots remaining</span>
      </p>
      <Button
        variant="outline"
        size="lg"
        className="border-secondary-foreground/40 text-secondary-foreground hover:bg-secondary-foreground/10 font-bold"
        asChild
      >
        <a href="/auth">Claim Launch Offer →</a>
      </Button>
    </div>
  </section>
);

export default LaunchOfferBanner;
