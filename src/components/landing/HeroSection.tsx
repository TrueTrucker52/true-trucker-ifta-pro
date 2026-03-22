import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowDown, Shield, Clock, CreditCard, RotateCcw, Star, Receipt, Route, ScanLine } from "lucide-react";
import heroMobile from "@/assets/landing-hero-truck-mobile.webp";
import heroDesktop from "@/assets/landing-hero-truck-desktop.webp";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(true);

  useEffect(() => {
    const handleScroll = () => setShowScrollCue(window.scrollY < 48);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToNextSection = () => {
    document.getElementById("pain-points")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden">
      {/* Background image with responsive WebP sources */}
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroMobile} type="image/webp" />
          <source media="(min-width: 769px)" srcSet={heroDesktop} type="image/webp" />
          <img
            src={heroDesktop}
            alt="Semi truck on American highway at sunset"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1440}
            height={810}
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--landing-navy))]/90 via-[hsl(var(--landing-navy))]/70 to-[hsl(var(--landing-navy))]/40" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-24 pb-28 md:px-10 md:pt-32 md:pb-32 lg:px-12">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:gap-14">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-[hsl(var(--landing-navy-foreground))] md:text-5xl lg:text-6xl">
              Stop Losing Money on IFTA.{" "}
              <span className="text-secondary">Start Filing in Minutes.</span> 🚛
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[hsl(var(--landing-navy-foreground))]/80 md:text-xl">
              The only IFTA app built for real truck drivers. Automatic mileage
              tracking, ELD compliance, BOL scanning, and GPS fleet management —
              all in one app from $39/month.
            </p>

            <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center md:flex-nowrap">
              <Button
                variant="hero"
                size="xl"
                className="w-full min-w-0 justify-center whitespace-nowrap bg-secondary hover:bg-secondary/90 sm:w-auto"
                onClick={() => navigate("/auth?mode=signup")}
              >
                🚀 Start Free 7‑Day Trial →
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full min-w-0 justify-center whitespace-nowrap border-2 border-[hsl(var(--landing-navy-foreground))] bg-[hsl(var(--landing-navy-foreground))]/10 text-[hsl(var(--landing-navy-foreground))] shadow-none hover:bg-[hsl(var(--landing-navy-foreground))]/20 hover:text-[hsl(var(--landing-navy-foreground))] sm:w-auto"
                onClick={() => setIsDemoOpen(true)}
              >
                ▶️ Watch 2 Minute Demo
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[hsl(var(--landing-navy-foreground))]/70">
              {[
                { icon: CreditCard, text: "No credit card required" },
                { icon: Clock, text: "7‑day free trial" },
                { icon: RotateCcw, text: "Cancel anytime" },
                { icon: Shield, text: "30‑day money‑back guarantee" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-accent" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:justify-end">
            <div className="w-full max-w-md rounded-[2rem] border border-[hsl(var(--landing-navy-foreground))]/15 bg-[hsl(var(--landing-navy-foreground))]/10 p-5 backdrop-blur-md shadow-2xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between text-[hsl(var(--landing-navy-foreground))]">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--landing-navy-foreground))]/60">
                    Live activity
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">Today&apos;s operation snapshot</h2>
                </div>
                <div className="rounded-full border border-[hsl(var(--landing-navy-foreground))]/20 bg-[hsl(var(--landing-navy-foreground))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--landing-navy-foreground))]/80">
                  Real-time
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: Route, label: "Miles tracked", value: "12,847" },
                  { icon: Receipt, label: "IFTA calculated", value: "$329" },
                  { icon: ScanLine, label: "BOLs scanned", value: "47" },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-[hsl(var(--landing-navy-foreground))]/15 bg-[hsl(var(--landing-navy-foreground))]/10 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-secondary/15 p-3 text-secondary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-[hsl(var(--landing-navy-foreground))]/65">{label}</p>
                        <p className="text-lg font-semibold text-[hsl(var(--landing-navy-foreground))]">{value}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--landing-navy-foreground))]/50">
                      synced
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[hsl(var(--landing-navy))]/80 backdrop-blur-sm border-t border-[hsl(var(--landing-navy-foreground))]/10">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[hsl(var(--landing-navy-foreground))]/80">
          <span>Trusted by 500+ truck drivers across 48 states 🇺🇸</span>
          <span className="flex items-center gap-0.5 text-secondary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-1 text-[hsl(var(--landing-navy-foreground))]/70">Average 4.9/5</span>
          </span>
        </div>
      </div>

      {showScrollCue && (
        <button
          type="button"
          aria-label="Scroll to learn more"
          onClick={scrollToNextSection}
          className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[hsl(var(--landing-navy-foreground))]/80 transition-opacity hover:text-[hsl(var(--landing-navy-foreground))]"
        >
          <span className="text-xs font-medium uppercase tracking-[0.24em]">Scroll</span>
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </button>
      )}

      <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
        <DialogContent className="max-w-md border-border bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground">
              🎬 Demo Video Coming Soon!
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-muted-foreground">
              Want to see TrueTrucker in action?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-muted-foreground">
            <p className="text-sm leading-relaxed">
              Sign up for your FREE 7-day trial and explore every feature yourself!
            </p>
            <ul className="space-y-2 text-sm">
              <li>✅ No credit card required</li>
              <li>✅ Full access for 7 days</li>
              <li>✅ Set up in under 5 minutes</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="hero"
              size="lg"
              className="w-full bg-secondary hover:bg-secondary/90"
              onClick={() => {
                setIsDemoOpen(false);
                navigate("/auth");
              }}
            >
              🚀 Start Free Trial Instead →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setIsDemoOpen(false)}
            >
              ✕ Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
