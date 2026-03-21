import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Solo",
    badge: "Most Popular",
    monthly: 39,
    trucks: "1 truck included",
    features: ["IFTA tracking", "ELD compliance", "Live GPS", "BOL scanning"],
    link: "https://buy.stripe.com/4gM28s4SncsG67FahjdEs03",
  },
  {
    name: "Small Fleet",
    badge: "Best Value",
    monthly: 79,
    trucks: "2–5 trucks included",
    features: ["Fleet dashboard", "Driver management", "Fleet messaging", "Combined IFTA reports"],
    link: "https://buy.stripe.com/3cIeVe2Kf3Wa9jRexzdEs04",
    highlight: true,
  },
  {
    name: "Fleet Pro",
    badge: null,
    monthly: 129,
    trucks: "6–10 trucks included",
    features: ["Advanced analytics", "DOT audit package", "Safety scores", "Priority support"],
    link: "https://buy.stripe.com/5kQ3cwacH50eanVfBDdEs05",
  },
  {
    name: "Enterprise",
    badge: null,
    monthly: 199,
    trucks: "11–25 trucks included",
    features: ["Dedicated support", "API access", "Custom onboarding", "SLA guarantee"],
    link: "https://buy.stripe.com/aFa3cw70v50ebrZ0GJdEs06",
  },
];

const PricingSection = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          Simple pricing for every trucker 💰
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          All plans include a 7‑day free trial and 30‑day money‑back guarantee.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center bg-muted rounded-full p-1 mb-12">
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${!annual ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setAnnual(false)}
          >
            Monthly
          </button>
          <button
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${annual ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setAnnual(true)}
          >
            Annual — Save 20%
          </button>
        </div>

        <div className="grid max-w-6xl gap-6 mx-auto mb-10 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const price = annual ? Math.round(p.monthly * 0.8) : p.monthly;
            return (
              <article
                key={p.name}
                className={`rounded-xl border p-6 text-left flex flex-col ${
                  p.highlight
                    ? "border-secondary shadow-lg ring-2 ring-secondary/30 relative"
                    : "border-border bg-card"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {p.badge}
                  </span>
                )}
                <header className="mb-6">
                  <h3 className="mb-1 text-lg font-bold text-card-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.trucks}</p>
                  <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">${price}</span>
                  <span className="text-muted-foreground">/mo</span>
                  </div>
                </header>
                <ul className="flex-1 mb-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mb-4 text-xs text-muted-foreground">See full comparison on the pricing page.</p>
                <Button
                  variant={p.highlight ? "hero" : "default"}
                  size="default"
                  className={p.highlight ? "bg-secondary hover:bg-secondary/90 w-full" : "w-full"}
                  asChild
                >
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    Start Free Trial →
                  </a>
                </Button>
              </article>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">
          Need more than 25 trucks?{" "}
          <a href="/contact" className="text-secondary font-semibold hover:underline">
            Contact us for custom pricing
          </a>{" "}
          · Extra trucks available at $12/truck/month on any plan.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
