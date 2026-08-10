import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ANNUAL_PLANS, ANNUAL_LABEL, AnnualPlanKey, financingCopy, formatMoney } from "@/lib/annualPlans";

const plans = [

  {
    name: "Solo",
    key: "solo" as AnnualPlanKey,
    badge: "Most Popular",
    monthly: 39,
    trucks: "1 truck included",
    features: ["IFTA tracking", "ELD compliance", "Live GPS", "BOL scanning"],
    link: "https://buy.stripe.com/4gM28s4SncsG67FahjdEs03",
  },
  {
    name: "Small Fleet",
    key: "small_fleet" as AnnualPlanKey,
    badge: "Best Value",
    monthly: 79,
    trucks: "2–5 trucks included",
    features: ["Fleet dashboard", "Driver management", "Fleet messaging", "Combined IFTA reports"],
    link: "https://buy.stripe.com/3cIeVe2Kf3Wa9jRexzdEs04",
    highlight: true,
  },
  {
    name: "Fleet Pro",
    key: "fleet_pro" as AnnualPlanKey,
    badge: null,
    monthly: 129,
    trucks: "6–10 trucks included",
    features: ["Advanced analytics", "DOT audit package", "Safety scores", "Priority support"],
    link: "https://buy.stripe.com/5kQ3cwacH50eanVfBDdEs05",
  },
  {
    name: "Enterprise",
    key: "enterprise" as AnnualPlanKey,
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
            Annual — {ANNUAL_LABEL}
          </button>
        </div>

        <div className="grid max-w-6xl gap-6 mx-auto mb-10 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const annualPlan = ANNUAL_PLANS[p.key];
            return (
              <article
                key={p.name}
                className={`relative rounded-xl border p-6 text-left flex flex-col ${
                  p.highlight
                    ? "border-secondary shadow-lg ring-2 ring-secondary/30 relative"
                    : "border-border bg-card"
                }`}
              >
                {p.badge && (
                  <span className="absolute right-4 top-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {p.badge}
                  </span>
                )}
                <header className="mb-6 pr-24">
                  <h3 className="mb-1 text-lg font-bold text-card-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.trucks}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-foreground">
                      ${annual ? formatMoney(annualPlan.annualPrice) : p.monthly}
                    </span>
                    <span className="text-muted-foreground">{annual ? "/yr" : "/mo"}</span>
                  </div>
                  {annual ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold text-accent">
                        {ANNUAL_LABEL} — saves ${formatMoney(annualPlan.savings)} vs monthly
                      </p>
                      <p className="text-xs text-muted-foreground">{financingCopy(annualPlan)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Billed monthly · cancel anytime
                    </p>
                  )}
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
                  {annual ? (
                    <a href="/pricing">Get Annual Plan →</a>
                  ) : (
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      Start 7‑Day Free Trial →
                    </a>
                  )}
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
