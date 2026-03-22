import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Shield, Truck, Users, Star, Zap, Crown, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Switch } from '@/components/ui/switch';
import { ELD_CHECKOUT_PLANS, ELD_COUPON } from '@/lib/eldUpgrade';

const plans = [
  {
    id: 'solo',
    name: 'Solo',
    icon: Truck,
    trucks: '1 truck',
    monthlyPrice: 39,
    description: 'Everything you need as an independent owner operator',
    features: [
      'All IFTA features included',
      'ELD integration',
      'GPS tracking',
      'Voice commands',
      'Receipt scanning',
      'Quarterly reports',
      'Tax calculator',
      'BOL management',
      'Route planning',
      'Data exporting',
    ],
    badge: null as string | null,
    extraTrucks: false,
  },
  {
    id: 'small_fleet',
    name: 'Small Fleet',
    icon: Users,
    trucks: '2–5 trucks',
    monthlyPrice: 79,
    description: 'Scale your operation with fleet management tools',
    features: [
      'Everything in Solo',
      'Fleet management dashboard',
      'Driver management',
      'Fleet analytics & reporting',
      'Team messaging',
      'Multi-vehicle tracking',
      'Centralized BOL management',
      'Fleet compliance tools',
    ],
    badge: 'MOST POPULAR',
    extraTrucks: true,
  },
  {
    id: 'fleet_pro',
    name: 'Fleet Pro',
    icon: Zap,
    trucks: '6–10 trucks',
    monthlyPrice: 129,
    description: 'Advanced tools for growing fleets',
    features: [
      'Everything in Small Fleet',
      'Advanced fleet analytics',
      'Geofencing & alerts',
      'Route optimization',
      'Load coordination',
      'Advanced compliance automation',
      'Priority support',
      'Custom report templates',
    ],
    badge: 'BEST VALUE',
    extraTrucks: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    trucks: '11–25 trucks',
    monthlyPrice: 199,
    description: 'Full-scale fleet operations with premium support',
    features: [
      'Everything in Fleet Pro',
      'Dedicated account manager',
      'API access & integrations',
      'White-label BOL solutions',
      'Custom workflow automation',
      'Phone support',
      'Custom training sessions',
      'Priority feature requests',
    ],
    badge: null,
    extraTrucks: true,
  },
] as const;

const featureRows = [
  { feature: 'IFTA Quarterly Reports', tiers: [true, true, true, true] },
  { feature: 'Receipt Scanning', tiers: [true, true, true, true] },
  { feature: 'GPS Tracking', tiers: [true, true, true, true] },
  { feature: 'ELD Compliance', tiers: ['+$10 add-on', '+$10/truck', '+$10/truck', '+$10/truck'] },
  { feature: 'Voice Commands', tiers: [true, true, true, true] },
  { feature: 'BOL Management', tiers: [true, true, true, true] },
  { feature: 'Fleet Dashboard', tiers: [false, true, true, true] },
  { feature: 'Geofencing & Alerts', tiers: [false, false, true, true] },
  { feature: 'API Access', tiers: [false, false, false, true] },
  { feature: 'Dedicated Support', tiers: [false, false, false, true] },
] as const;

const faqs = [
  { q: 'Do I need a credit card to start the free trial?', a: 'No credit card is required to start your 7-day free trial. You get full access to all features during the trial period.' },
  { q: 'What happens after my trial ends?', a: "After your 7-day trial, you can choose a plan that fits your needs. If you don't subscribe, your account will be paused but your data is preserved." },
  { q: 'Can I switch plans later?', a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.' },
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time with no penalties or hidden fees.' },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout, subscription_tier } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [comparisonTab, setComparisonTab] = useState(0);

  const getPrice = (plan: typeof plans[number]) => {
    if (annual) return Math.round(plan.monthlyPrice * 12 * 0.8);
    return plan.monthlyPrice;
  };

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
    setLoading(planId);
    try {
      const suffix = annual ? '_annual' : '';
      await createCheckout(planId + suffix);
    } finally {
      setLoading(null);
    }
  };

  const handleEldCheckout = async (billing: 'monthly' | 'annual') => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    const loadingKey = `eld_${billing}`;
    setLoading(loadingKey);
    try {
      await createCheckout(ELD_CHECKOUT_PLANS[billing], ELD_COUPON.code);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Choose the plan that fits your fleet. All plans include a 7-day free trial — no credit card required.
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
            {annual && <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/30">Save 20%</Badge>}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" /> 30-day money-back guarantee
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> No credit card for trial
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" /> Cancel anytime
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 gap-6 mx-auto mb-16 max-w-7xl md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const Icon = plan.icon;
            const isPopular = plan.badge === 'MOST POPULAR';
            const isBestValue = plan.badge === 'BEST VALUE';
            const isCurrent = subscription_tier === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col ${
                  isPopular ? 'border-primary shadow-xl ring-2 ring-primary/40 scale-[1.02]' :
                  isBestValue ? 'border-accent shadow-lg ring-1 ring-accent/40' :
                  'border-border'
                } rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl`}
              >
                {plan.badge && (
                  <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                    isPopular ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    {isPopular && <Star className="h-3 w-3 mr-1" />}
                    {isBestValue && <Crown className="h-3 w-3 mr-1" />}
                    {plan.badge}
                  </Badge>
                )}

                <header className="mb-5 text-center">
                  <span className="inline-flex items-center justify-center p-2.5 mb-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </span>
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <p className="text-xs font-semibold tracking-wide uppercase text-primary/80">{plan.trucks}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <p className="mt-4">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{annual ? 'year' : 'mo'}</span>
                  </p>
                  {annual && (
                    <p className="mt-1 text-xs font-semibold text-green-600">
                      ${Math.round(price / 12)}/mo billed annually
                    </p>
                  )}
                  {plan.extraTrucks && <p className="mt-1 text-xs text-muted-foreground">Extra trucks: $12/truck/mo</p>}
                  <p className="mt-1 text-xs font-semibold text-green-600">7-day free trial</p>
                </header>

                <ul className="flex-1 mb-6 space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isPopular ? 'hero' : 'outline'}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading === plan.id || isCurrent}
                  size="lg"
                >
                  {loading === plan.id ? 'Setting up...' : isCurrent ? 'Current Plan' : 'Start Free Trial'}
                </Button>
                <p className="mt-2 text-xs text-center text-muted-foreground">Cancel anytime • No setup fees</p>
              </article>
            );
          })}
        </section>

        {/* Tabbed Feature Comparison — minimal DOM */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Feature Comparison</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {plans.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setComparisonTab(i)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  comparisonTab === i
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="p-4 border rounded-lg bg-card">
            <header className="flex items-center gap-3 pb-4 mb-4 border-b">
              {(() => {
                const Icon = plans[comparisonTab].icon;
                return <Icon className="h-6 w-6 text-primary" />;
              })()}
              <div>
                <h3 className="text-lg font-bold">{plans[comparisonTab].name}</h3>
                <p className="text-sm text-muted-foreground">{plans[comparisonTab].trucks} • ${getPrice(plans[comparisonTab])}/{annual ? 'year' : 'mo'}</p>
              </div>
            </header>
            <ul className="space-y-3">
              {featureRows.map((row) => (
                <li key={row.feature} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{row.feature}</span>
                  {typeof row.tiers[comparisonTab] === 'string' ? (
                    <span className="text-xs font-medium text-primary">{row.tiers[comparisonTab]}</span>
                  ) : row.tiers[comparisonTab] ? (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <span className="text-muted-foreground/40 text-xs">—</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="eld-addon" className="max-w-3xl mx-auto mb-16 rounded-2xl border bg-card p-6">
          <p className="mb-2 text-sm font-semibold tracking-wide text-primary">⚖️ ADD ELD COMPLIANCE TO ANY PLAN</p>
          <h2 className="text-2xl font-bold">Already have a plan? Add full FMCSA certified ELD compliance.</h2>
          <p className="mt-2 text-muted-foreground">$10/truck/month or $96/truck/year. Use code <span className="font-semibold text-foreground">{ELD_COUPON.code}</span> for 30% off your first 3 months.</p>
          <ul className="grid gap-2 mt-5 sm:grid-cols-2">
            {['FMCSA certified ELD', 'HOS tracking and alerts', 'DOT inspection mode', 'Log transfer to inspector', '8 day history', 'Safety score'].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 mt-6 sm:grid-cols-2">
            <Button size="lg" onClick={() => handleEldCheckout('monthly')} disabled={loading === 'eld_monthly'}>
              {loading === 'eld_monthly' ? 'Opening checkout…' : 'Add ELD — Monthly $10/truck'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleEldCheckout('annual')} disabled={loading === 'eld_annual'}>
              {loading === 'eld_annual' ? 'Opening checkout…' : 'Add ELD — Annual $8/truck'}
            </Button>
          </div>
        </section>

        {/* 30-day guarantee */}
        <div className="max-w-2xl mx-auto mb-16 bg-muted/50 p-8 rounded-xl text-center border">
          <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-muted-foreground text-sm">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </div>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="overflow-hidden border rounded-lg bg-card group"
                open={openFaq === i}
                onToggle={(event) => setOpenFaq((event.currentTarget as HTMLDetailsElement).open ? i : null)}
              >
                <summary className="flex items-center justify-between p-5 text-sm font-semibold list-none cursor-pointer">
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="flex-shrink-0 w-4 h-4" /> : <ChevronDown className="flex-shrink-0 w-4 h-4" />}
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline">← Back to Home</Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
