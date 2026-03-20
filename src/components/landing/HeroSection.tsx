import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Clock, CreditCard, RotateCcw, Star } from "lucide-react";
import heroTruck from "@/assets/landing-hero-truck.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroTruck}
          alt="Semi truck on American highway at sunset"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--landing-navy))]/90 via-[hsl(var(--landing-navy))]/70 to-[hsl(var(--landing-navy))]/40" />
      </div>

      <div className="relative container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[hsl(var(--landing-navy-foreground))] leading-tight mb-6">
            Stop Losing Money on IFTA.{" "}
            <span className="text-secondary">Start Filing in Minutes.</span> 🚛
          </h1>
          <p className="text-lg md:text-xl text-[hsl(var(--landing-navy-foreground))]/80 mb-8 leading-relaxed max-w-xl">
            The only IFTA app built for real truck drivers. Automatic mileage
            tracking, ELD compliance, BOL scanning, and GPS fleet management —
            all in one app from $39/month.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              variant="hero"
              size="xl"
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => navigate("/auth")}
            >
              🚀 Start Free 7‑Day Trial →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[hsl(var(--landing-navy-foreground))]/30 text-[hsl(var(--landing-navy-foreground))] hover:bg-[hsl(var(--landing-navy-foreground))]/10"
              onClick={() => navigate("/demo")}
            >
              ▶️ Watch 2‑Minute Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[hsl(var(--landing-navy-foreground))]/70">
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
    </section>
  );
};

export default HeroSection;
