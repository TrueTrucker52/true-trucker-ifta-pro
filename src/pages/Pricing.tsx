import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Shield, Truck, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'small',
      name: 'Starter',
      price: 29,
      period: 'month',
      description: 'Perfect for individual truckers',
      popular: false,
      features: [
        'IFTA Quarterly Reports',
        'Fuel Receipt Scanning',
        'Basic Mileage Tracking',
        'Tax Calculator',
        'BOL Management & Scanning',
        'Email Support',
        'Up to 2 Vehicles',
        'Smart Location Auto-Complete',
        'Professional Trip Editing',
        'Kentucky KYU Compliance',
        'Mobile Trip Entry',
        'Generate Trip Sheets',
        'Quarterly Mileage Returns',
        'Recap Reports',
        'Truck Reports',
        'Auto Routing & Calculations',
        'Data Exporting'
      ],
      cta: 'Start 7-Day Free Trial',
    },
    {
      id: 'medium',
      name: 'Professional',
      price: 59,
      period: 'month',
      description: 'Ideal for small fleet operators',
      popular: true,
      features: [
        'Everything in Starter',
        'Advanced Route Planning',
        'Multiple Vehicle Management',
        'Automated Tax Calculations',
        'Advanced BOL Document Management',
        'Priority Support',
        'Up to 10 Vehicles',
        'Fleet Analytics',
        'Advanced Reporting',
        'Enhanced Customer Support'
      ],
      cta: 'Start 7-Day Free Trial',
    },
    {
      id: 'large',
      name: 'Enterprise',
      price: 129,
      period: 'month',
      description: 'For large fleets and corporations',
      popular: false,
      features: [
        'Everything in Professional',
        'Unlimited Vehicles',
        'Enterprise BOL Management Suite',
        'API Access',
        'Custom Integrations',
        'Dedicated Account Manager',
        'White-label Options',
        'Advanced Reporting',
        'Phone Support',
        'Custom Training Sessions',
        'Priority Feature Requests'
      ],
      cta: 'Start 7-Day Free Trial',
    },
  ];

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    setLoading(planId);
    try {
      await createCheckout(planId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with a 7-day free trial. No credit card required, but credit card trials offer better consumer protection.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg border text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Consumer Protection</h3>
            <p className="text-sm text-muted-foreground">
              Credit card trials provide chargeback protection if the service doesn't meet expectations
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">IFTA Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Verify our software meets FMCSA IFTA and ELD requirements before committing
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border text-center">
            <CreditCard className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Flexible Billing</h3>
            <p className="text-sm text-muted-foreground">
              Cancel anytime. No long-term contracts or hidden fees
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? 'Setting up...' : plan.cta}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-3">
                  7-day free trial • Cancel anytime
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Why use a credit card for the trial?</h3>
              <p className="text-sm text-muted-foreground">
                While not required, credit card trials offer consumer protection through chargeback rights if the software doesn't meet your needs or comply with regulations.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Is this software IFTA/ELD compliant?</h3>
              <p className="text-sm text-muted-foreground">
                Please verify that our software aligns with IFTA/ELD requirements under FMCSA rules before subscribing. We recommend checking the latest regulations.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time through your account dashboard or customer portal.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <Button onClick={() => navigate('/')} variant="outline">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;