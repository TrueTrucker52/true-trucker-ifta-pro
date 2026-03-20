import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Crown, Truck, Users, Zap, Building2, Shield, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription_tier, createCheckout } = useSubscription();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    { id: 'solo', name: 'Solo', icon: Truck, trucks: '1 truck', monthlyPrice: 39, badge: null },
    { id: 'small_fleet', name: 'Small Fleet', icon: Users, trucks: '2–5 trucks', monthlyPrice: 79, badge: 'MOST POPULAR' },
    { id: 'fleet_pro', name: 'Fleet Pro', icon: Zap, trucks: '6–10 trucks', monthlyPrice: 129, badge: 'BEST VALUE' },
    { id: 'enterprise', name: 'Enterprise', icon: Building2, trucks: '11–25 trucks', monthlyPrice: 199, badge: null },
  ];

  const getPrice = (p: typeof plans[0]) => annual ? Math.round(p.monthlyPrice * 12 * 0.8) : p.monthlyPrice;

  const handlePlanClick = (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const suffix = annual ? '_annual' : '';
    createCheckout(planId + suffix);
  };

  const features = [
    { name: 'IFTA Quarterly Reports', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { name: 'GPS & ELD', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { name: 'Voice Commands', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { name: 'Receipt Scanning', solo: true, small_fleet: true, fleet_pro: true, enterprise: true },
    { name: 'Fleet Dashboard', solo: false, small_fleet: true, fleet_pro: true, enterprise: true },
    { name: 'Geofencing', solo: false, small_fleet: false, fleet_pro: true, enterprise: true },
    { name: 'API Access', solo: false, small_fleet: false, fleet_pro: false, enterprise: true },
    { name: 'Dedicated Support', solo: false, small_fleet: false, fleet_pro: false, enterprise: true },
  ];

  const faqs = [
    { q: 'Do I need a credit card for the trial?', a: 'No. Start your 7-day free trial with no credit card required.' },
    { q: 'Can I add extra trucks?', a: 'Yes — Small Fleet, Fleet Pro, and Enterprise plans support extra trucks at $12/truck/month.' },
    { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel anytime with no penalties or hidden fees.' },
    { q: 'Is there a money-back guarantee?', a: 'Yes — 30-day money-back guarantee on all plans.' },
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            7-day free trial on every plan — no credit card required
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
            {annual && <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/30">Save 20%</Badge>}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" /> 30-day money-back guarantee
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> No credit card for trial
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const Icon = plan.icon;
            const isPopular = plan.badge === 'MOST POPULAR';
            const isBestValue = plan.badge === 'BEST VALUE';
            const isCurrent = subscription_tier === plan.id;

            return (
              <Card key={plan.id} className={`relative flex flex-col ${
                isPopular ? 'border-primary shadow-xl ring-2 ring-primary/40 scale-[1.02]' :
                isBestValue ? 'border-accent shadow-lg ring-1 ring-accent/40' : ''
              } hover:shadow-xl transition-all`}>
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
                  <div className="bg-primary/10 p-2.5 rounded-full w-fit mx-auto mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-semibold text-primary/80 uppercase tracking-wide">{plan.trucks}</CardDescription>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{annual ? 'year' : 'mo'}</span>
                  </div>
                  {plan.id !== 'solo' && <p className="text-xs text-muted-foreground mt-1">Extra trucks: $12/truck/mo</p>}
                  <p className="text-xs text-green-600 font-semibold mt-1">7-day free trial</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1" />
                  <Button
                    variant={isPopular ? 'hero' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanClick(plan.id)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : 'Start Free Trial'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">Cancel anytime</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature comparison (desktop) */}
        <div className="hidden md:block max-w-5xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-center mb-6">Feature Comparison</h3>
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
                {features.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium text-sm">{row.name}</TableCell>
                    {(['solo', 'small_fleet', 'fleet_pro', 'enterprise'] as const).map((p) => (
                      <TableCell key={p} className="text-center">
                        {row[p] ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-2xl mx-auto mb-16 bg-muted/50 p-8 rounded-xl text-center border">
          <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-muted-foreground text-sm">Not satisfied? Full refund within 30 days, no questions asked.</p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card border rounded-lg overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
