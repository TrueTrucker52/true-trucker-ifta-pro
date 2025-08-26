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
      name: 'Solo Driver',
      price: 25,
      period: 'month',
      description: '⚠️ Limited to 2 trucks only',
      popular: false,
      limitation: '2 Truck Limit',
      features: [
        'IFTA Quarterly Reports',
        'Fuel Receipt Scanning',
        'Basic Mileage Tracking',
        'Tax Calculator',
        '📋 Basic BOL Management & Scanning',
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
      bolFeatures: [
        'Basic BOL scanning and storage',
        'Simple load tracking',
        'Basic document management'
      ]
    },
    {
      id: 'medium',
      name: 'Fleet Manager',
      price: 49,
      period: 'month',
      description: '🚛 Scale to 10 trucks + Premium BOL Management',
      popular: true,
      badge: 'MOST POPULAR',
      savings: 'Save $450/month vs competitors',
      features: [
        'Everything in Starter',
        'Advanced Route Planning',
        'Multiple Vehicle Management',
        'Automated Tax Calculations',
        '🚛 Advanced Fleet BOL Management',
        '📊 BOL Analytics & Reporting',
        '🔄 Automated BOL Processing',
        'Priority Support',
        'Up to 10 Vehicles',
        'Fleet Analytics',
        'Advanced Reporting',
        'Enhanced Customer Support'
      ],
      cta: 'Start 7-Day Free Trial',
      bolFeatures: [
        'Advanced BOL scanning with AI recognition',
        'Multi-vehicle load coordination',
        'Fleet-wide BOL analytics',
        'Automated compliance tracking',
        'Load optimization recommendations',
        'Customer portal integration'
      ]
    },
    {
      id: 'large',
      name: 'Fleet Empire',
      price: 99,
      period: 'month',
      description: '🏢 Unlimited trucks + White-label solutions',
      popular: false,
      badge: 'BEST VALUE',
      roi: 'ROI: 340% within 6 months',
      features: [
        'Everything in Professional',
        'Unlimited Vehicles',
        '🏢 Enterprise BOL Management Suite',
        '🔗 BOL API & Custom Integrations',
        '📈 Advanced BOL Analytics Dashboard',
        '🎯 White-label BOL Solutions',
        'API Access',
        'Custom Integrations',
        'Dedicated Account Manager',
        'Phone Support',
        'Custom Training Sessions',
        'Priority Feature Requests'
      ],
      cta: 'Start 7-Day Free Trial',
      bolFeatures: [
        'Complete BOL lifecycle management',
        'Custom BOL templates and branding',
        'Real-time fleet visibility',
        'Advanced compliance automation',
        'Integration with TMS/ERP systems',
        'Dedicated BOL support specialist',
        'Custom BOL workflow automation',
        'Enterprise-grade security & compliance'
      ]
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
          
          {/* Urgency & Social Proof */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-semibold text-sm">LIMITED TIME: SCALE YOUR FLEET</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <p className="text-sm text-red-700">Join 10,000+ truckers who've automated their operations • 89% upgrade to fleet management</p>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Stop Running 1-Truck Operations
            <span className="block text-primary">Upgrade to Fleet Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            From solo driver to fleet operator in 7 days. Manage unlimited trucks, automate BOL processing, and scale your revenue.
          </p>
          
          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-700 font-semibold">💰 Average customers add 3-5 trucks within 90 days • $2,500+ monthly revenue increase</p>
          </div>
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

        {/* BOL Management Showcase */}
        <div className="mb-12 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">🚛 Professional BOL Management</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Transform your freight operations with our intelligent Bill of Lading management system. 
              Scan, track, and manage all your loads with AI-powered automation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-card rounded-lg border">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Smart BOL Scanning</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered OCR extracts all data from your BOL documents instantly
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Fleet Coordination</h4>
              <p className="text-sm text-muted-foreground">
                Coordinate multiple vehicles and drivers with centralized load management
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg border">
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Revenue Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Track freight charges and analyze profitability per load automatically
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/50' : 'border-border'} hover:shadow-xl transition-all duration-300`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white animate-pulse">
                  🔥 {plan.badge || 'Most Popular'}
                </Badge>
              )}
              
              {plan.limitation && (
                <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                  <span className="text-red-600 text-xs font-semibold">{plan.limitation}</span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className={`text-2xl ${plan.popular ? 'text-primary' : ''}`}>{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                
                {plan.savings && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mb-2">
                    <span className="text-green-600 text-sm font-semibold">{plan.savings}</span>
                  </div>
                )}
                
                {plan.roi && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-2">
                    <span className="text-blue-600 text-sm font-semibold">{plan.roi}</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                  <div className="text-sm text-green-600 font-semibold mt-1">7-day free trial</div>
                  {plan.popular && (
                    <div className="text-xs text-blue-600 font-semibold">Pays for itself in 2 weeks</div>
                  )}
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

                {/* BOL Features Highlight */}
                {plan.bolFeatures && (
                  <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-sm mb-3 text-primary">🚛 BOL Management Features:</h4>
                    <ul className="space-y-2">
                      {plan.bolFeatures.map((bolFeature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{bolFeature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button
                  className={`w-full ${plan.popular ? 'animate-pulse' : ''}`}
                  variant={plan.popular ? "hero" : "outline"}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? 'Setting up...' : 
                    plan.id === 'small' ? 'START SOLO ($25)' :
                    plan.id === 'medium' ? '🚀 SCALE TO FLEET ($49)' : 
                    '💎 BUILD EMPIRE ($99)'
                  }
                </Button>
                
                <div className="text-center mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    7-day free trial, then ${plan.price}/month • No setup fees
                  </p>
                  {plan.popular && (
                    <p className="text-xs text-green-600 font-semibold">
                      ⚡ Setup in 5 minutes • Start earning today
                    </p>
                  )}
                </div>
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
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">What makes your BOL management special?</h3>
              <p className="text-sm text-muted-foreground">
                Our AI-powered BOL system automatically extracts data from documents, tracks freight revenue, and provides fleet-wide visibility. Professional and Enterprise plans include advanced coordination tools and compliance automation.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-2">Can I upgrade my plan later?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! You can upgrade your plan at any time through your customer portal. The upgrade takes effect immediately and you'll only pay the prorated difference.
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