import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, CreditCard, Shield, Truck, Users, Star, Zap, Crown, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout, subscription_tier } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      cta: 'Start Free Trial',
      badge: null,
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
      cta: 'Start Free Trial',
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
      cta: 'Start Free Trial',
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
      cta: 'Start Free Trial',
      badge: null,
      extraTrucks: true,
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
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

  const competitors = [
    { name: 'TrueTrucker IFTA Pro', solo: 39, fleet: 79, note: 'All features included' },
    { name: 'Competitor A', solo: 69, fleet: 149, note: 'Limited features' },
    { name: 'Competitor B', solo: 59, fleet: 129, note: 'No ELD/GPS' },
    { name: 'Competitor C', solo: 49, fleet: 199, note: 'Per-truck pricing only' },
  ];

  const featureComparison = [
    { feature: 'IFTA Quarterly Reports', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'Receipt Scanning', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'GPS Tracking', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'ELD Integration', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'Voice Commands', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'BOL Management', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'Fleet Dashboard', solo: false, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'Driver Management', solo: false, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'Team Messaging', solo: false, small_fleet: true, fleet_pro: true, enterprise: true },
    { feature: 'Geofencing & Alerts', solo: false, small_fleet: false, fleet_pro: true, enterprise: true },
    { feature: 'Route Optimization', solo: false, small_fleet: false, fleet_pro: true, enterprise: true },
    { feature: 'Advanced Analytics', solo: false, small_fleet: false, fleet_pro: true, enterprise: true },
    { feature: 'API Access', solo: false, small_fleet: false, fleet_pro: false, enterprise: true },
    { feature: 'Dedicated Support', solo: false, small_fleet: false, fleet_pro: false, enterprise: true },
    { feature: 'White-label Solutions', solo: false, small_fleet: false, fleet_pro: false, enterprise: true },
  ];

  const faqs = [
    { q: 'Do I need a credit card to start the free trial?', a: 'No credit card is required to start your 7-day free trial. You get full access to all features during the trial period.' },
    { q: 'What happens after my trial ends?', a: 'After your 7-day trial, you can choose a plan that fits your needs. If you don\'t subscribe, your account will be paused but your data is preserved.' },
    { q: 'Can I switch plans later?', a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.' },
    { q: 'What if I need more trucks than my plan allows?', a: 'Small Fleet, Fleet Pro, and Enterprise plans support extra trucks at $12/truck/month. You can add or remove trucks anytime.' },
    { q: 'Is there a money-back guarantee?', a: 'Yes! We offer a 30-day money-back guarantee on all plans. If you\'re not satisfied, contact us for a full refund.' },
    { q: 'Do you support all IFTA jurisdictions?', a: 'Yes! We support all 48 contiguous US states plus the 10 Canadian provinces that participate in IFTA.' },
    { q: 'Is my data secure?', a: 'We use bank-level encryption and your data is backed up daily in secure cloud storage. We never sell or share your data.' },
    { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time with no penalties or hidden fees.' },
  ];

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

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
            {annual && <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/30">Save 20%</Badge>}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              No credit card for trial
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const Icon = plan.icon;
            const isPopular = plan.badge === 'MOST POPULAR';
            const isBestValue = plan.badge === 'BEST VALUE';
            const isCurrent = subscription_tier === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  isPopular ? 'border-primary shadow-xl ring-2 ring-primary/40 scale-[1.02]' :
                  isBestValue ? 'border-accent shadow-lg ring-1 ring-accent/40' :
                  'border-border'
                } hover:shadow-xl transition-all duration-300`}
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

                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-primary/10 p-2.5 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-semibold text-primary/80 uppercase tracking-wide">{plan.trucks}</CardDescription>
                  <CardDescription className="min-h-[36px] text-sm">{plan.description}</CardDescription>

                  <div className="mt-3">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{annual ? 'year' : 'mo'}</span>
                    {annual && (
                      <div className="text-xs text-green-600 font-semibold mt-1">
                        ${Math.round(price / 12)}/mo billed annually
                      </div>
                    )}
                  </div>
                  {plan.extraTrucks && (
                    <p className="text-xs text-muted-foreground mt-1">Extra trucks: $12/truck/mo</p>
                  )}
                  <p className="text-xs text-green-600 font-semibold mt-1">7-day free trial</p>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-2.5 mb-6 flex-1">
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
                    {loading === plan.id ? 'Setting up...' : isCurrent ? 'Current Plan' : plan.cta}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">Cancel anytime • No setup fees</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead className="text-center">Solo</TableHead>
                  <TableHead className="text-center">Small Fleet</TableHead>
                  <TableHead className="text-center">Fleet Pro</TableHead>
                  <TableHead className="text-center">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureComparison.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-medium text-sm">{row.feature}</TableCell>
                    {(['solo', 'small_fleet', 'fleet_pro', 'enterprise'] as const).map((plan) => (
                      <TableCell key={plan} className="text-center">
                        {row[plan] ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-2">See How We Compare</h2>
          <p className="text-center text-muted-foreground mb-6">Save hundreds every month vs the competition</p>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-center">Solo Price</TableHead>
                  <TableHead className="text-center">Fleet Price</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((c, i) => (
                  <TableRow key={c.name} className={i === 0 ? 'bg-primary/5 font-semibold' : ''}>
                    <TableCell>
                      {i === 0 && <Star className="h-4 w-4 text-primary inline mr-1" />}
                      {c.name}
                    </TableCell>
                    <TableCell className="text-center">${c.solo}/mo</TableCell>
                    <TableCell className="text-center">${c.fleet}/mo</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 30-day guarantee */}
        <div className="max-w-2xl mx-auto mb-16 bg-muted/50 p-8 rounded-xl text-center border">
          <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-muted-foreground text-sm">
            Not satisfied? Get a full refund within 30 days, no questions asked. We're confident you'll love TrueTrucker IFTA Pro.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-card border rounded-lg overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline">← Back to Home</Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
