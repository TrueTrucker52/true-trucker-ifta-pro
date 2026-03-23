import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  { num: "1", emoji: "🚀", title: "Sign Up Free", desc: "Create your account in 60 seconds. No credit card needed to start." },
  { num: "2", emoji: "🚛", title: "Set Up Your Truck", desc: "Add your truck details and connect your fleet. Takes about 3 minutes." },
  { num: "3", emoji: "📋", title: "Start Tracking", desc: "Hit the road and let TrueTrucker track everything automatically." },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-[hsl(var(--landing-gray))] py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-lg font-semibold text-destructive mb-4">⚠️ Quarter One IFTA Deadline: April 30 — File on time with TrueTrucker</h3>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-14">
          Up and running in 5 minutes ⏱️
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-extrabold mb-4">
                {s.num}
              </div>
              <span className="text-3xl mb-2">{s.emoji}</span>
              <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <Button variant="hero" size="lg" className="bg-secondary hover:bg-secondary/90" onClick={() => navigate("/auth")}>
          Start Free in 5 Minutes →
        </Button>
      </div>
    </section>
  );
};

export default HowItWorks;
