import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Clock, RotateCcw, CreditCard, Smartphone, Award } from "lucide-react";

const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-[hsl(var(--landing-navy))] py-20 md:py-28">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[hsl(var(--landing-navy-foreground))] mb-6 leading-tight">
          Ready to never stress about IFTA again? 🚛
        </h2>
        <p className="text-lg text-[hsl(var(--landing-navy-foreground))]/70 mb-10">
          Join 500+ truck drivers who already save hours every quarter with TrueTrucker IFTA Pro.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button variant="hero" size="xl" className="bg-secondary hover:bg-secondary/90" onClick={() => navigate("/auth")}>
            🚀 Start Free 7‑Day Trial →
          </Button>
          <Button variant="outline" size="lg" className="border-[hsl(var(--landing-navy-foreground))]/30 text-[hsl(var(--landing-navy-foreground))] hover:bg-[hsl(var(--landing-navy-foreground))]/10" onClick={() => navigate("/contact")}>
            💬 Talk to a Real Person
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[hsl(var(--landing-navy-foreground))]/60">
          {[
            { icon: CreditCard, text: "No credit card required" },
            { icon: Clock, text: "Setup in 5 minutes" },
            { icon: RotateCcw, text: "Cancel anytime" },
            { icon: Shield, text: "30‑day money‑back" },
            { icon: Award, text: "FMCSA certified ELD" },
            { icon: Smartphone, text: "Android + iPhone" },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-accent" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
