import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const testimonials = [
  {
    text: "I used to spend 4 hours every quarter on IFTA paperwork. Now it takes me 10 minutes. Worth every penny at $39 a month.",
    name: "Mike J.",
    role: "Owner Operator, Texas",
  },
  {
    text: "Got pulled over at a weigh station in Georgia. Opened TrueTrucker, hit inspection mode, transferred logs in 30 seconds. Officer was impressed.",
    name: "Carlos R.",
    role: "CDL Driver, Georgia",
  },
  {
    text: "I manage 5 trucks and used to pay $225/month just for ELD. Now I pay $79/month and get ELD plus GPS plus IFTA plus everything. Game changer.",
    name: "Sarah L.",
    role: "Fleet Owner, Florida",
  },
];

const TestimonialsSection = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-[hsl(var(--landing-navy))] py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--landing-navy-foreground))] mb-14">
          Real truckers. Real results. 🚛
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[hsl(var(--landing-navy-foreground))]/5 border border-[hsl(var(--landing-navy-foreground))]/10 rounded-xl p-8 text-left">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-[hsl(var(--landing-navy-foreground))]/90 mb-6 leading-relaxed italic">
                "{t.text}"
              </p>
              <p className="font-bold text-[hsl(var(--landing-navy-foreground))]">— {t.name}</p>
              <p className="text-sm text-[hsl(var(--landing-navy-foreground))]/60">{t.role}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="flex items-center gap-1 text-secondary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </span>
          <p className="text-[hsl(var(--landing-navy-foreground))]/70 mb-4">
            Join 500+ happy truckers
          </p>
          <Button variant="hero" size="lg" className="bg-secondary hover:bg-secondary/90" onClick={() => navigate("/auth")}>
            Start Your Free Trial →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
