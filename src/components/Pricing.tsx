import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription_tier, createCheckout } = useSubscription();

  const handlePlanClick = (plan: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      createCheckout(plan);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Simple, Honest
            <span className="block text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No hidden fees, no surprises. Just one low monthly price that gives you everything you need.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Small Fleet Plan */}
          <Card className={`border-2 shadow-lg relative overflow-hidden ${
            subscription_tier === 'small' 
              ? 'border-primary bg-primary/5' 
              : 'border-border'
          }`}>
            {subscription_tier === 'small' && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-primary px-4 py-2 rounded-full flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-white" />
                  <span className="text-white font-semibold text-sm">Current Plan</span>
                </div>
              </div>
            )}
            <CardHeader className="text-center pt-8 pb-6">
              <CardTitle className="text-xl font-bold text-foreground mb-2">
                Small Fleet
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-6">
                Perfect for owner-operators and small fleets
              </CardDescription>
              
              {/* Pricing */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-success/10 text-success px-4 py-2 rounded-full inline-block mb-4">
                    <span className="font-semibold">7-Day FREE Trial</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-foreground">$20</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  1-3 trucks • Cancel anytime
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {[
                  "Up to 3 trucks/trailers",
                  "Unlimited mileage tracking", 
                  "All 48 states + Canadian provinces",
                  "Receipt scanning & OCR",
                  "Quarterly return generation",
                  "Real-time fuel tax calculations",
                  "Mobile & desktop access",
                  "Secure cloud backup",
                  "Email support",
                  "Basic audit reports"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-4 pt-6">
              <Button 
                variant={subscription_tier === 'small' ? 'default' : 'outline'}
                size="lg" 
                className="w-full"
                onClick={() => handlePlanClick('small')}
                disabled={subscription_tier === 'small'}
              >
                {subscription_tier === 'small' ? 'Current Plan' : 'Start Free Trial'}
              </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medium Fleet Plan - Most Popular */}
          <Card className={`border-2 shadow-xl relative overflow-hidden ${
            subscription_tier === 'medium' 
              ? 'border-primary bg-primary/5' 
              : 'border-primary/20'
          }`}>
            {/* Popular Badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {subscription_tier === 'medium' ? (
                <div className="bg-primary px-4 py-2 rounded-full flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-white" />
                  <span className="text-white font-semibold text-sm">Current Plan</span>
                </div>
              ) : (
                <div className="bg-gradient-sunset px-6 py-2 rounded-full flex items-center space-x-2">
                  <Star className="h-4 w-4 text-white" />
                  <span className="text-white font-semibold text-sm">Most Popular</span>
                </div>
              )}
            </div>

            <CardHeader className="text-center pt-12 pb-6">
              <CardTitle className="text-xl font-bold text-foreground mb-2">
                Medium Fleet
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-6">
                Ideal for growing trucking operations
              </CardDescription>
              
              {/* Pricing */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-success/10 text-success px-4 py-2 rounded-full inline-block mb-4">
                    <span className="font-semibold">7-Day FREE Trial</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-foreground">$40</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  4-7 trucks • Cancel anytime
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {[
                  "Up to 7 trucks/trailers",
                  "Unlimited mileage tracking",
                  "All 48 states + Canadian provinces", 
                  "Advanced receipt scanning & OCR",
                  "Automated quarterly returns",
                  "Real-time fuel tax calculations",
                  "Mobile & desktop access",
                  "Secure cloud backup",
                  "Priority email support",
                  "Advanced fleet management",
                  "Driver assignment tracking",
                  "Comprehensive audit reports"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-4 pt-6">
                <Button 
                  variant={subscription_tier === 'medium' ? 'default' : 'hero'}
                  size="lg" 
                  className="w-full"
                  onClick={() => handlePlanClick('medium')}
                  disabled={subscription_tier === 'medium'}
                >
                  {subscription_tier === 'medium' ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Start Your Free Trial
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  No credit card required for trial
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Large Fleet Plan */}
          <Card className={`border-2 shadow-lg relative overflow-hidden ${
            subscription_tier === 'large' 
              ? 'border-primary bg-primary/5' 
              : 'border-border'
          }`}>
            {subscription_tier === 'large' && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-primary px-4 py-2 rounded-full flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-white" />
                  <span className="text-white font-semibold text-sm">Current Plan</span>
                </div>
              </div>
            )}
            <CardHeader className="text-center pt-8 pb-6">
              <CardTitle className="text-xl font-bold text-foreground mb-2">
                Large Fleet
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-6">
                Enterprise solution for established fleets
              </CardDescription>
              
              {/* Pricing */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-success/10 text-success px-4 py-2 rounded-full inline-block mb-4">
                    <span className="font-semibold">7-Day FREE Trial</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-foreground">$75</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  8-12 trucks • Cancel anytime
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {[
                  "Up to 12 trucks/trailers",
                  "Unlimited mileage tracking",
                  "All 48 states + Canadian provinces",
                  "AI-powered receipt processing",
                  "Automated quarterly & annual returns",
                  "Real-time multi-state tax calculations",
                  "Mobile & desktop access",
                  "Enterprise cloud backup",
                  "Dedicated account manager",
                  "Advanced fleet analytics",
                  "Multi-driver management",
                  "Custom compliance reports",
                  "API access for integrations",
                  "Priority audit assistance"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-4 pt-6">
                <Button 
                  variant={subscription_tier === 'large' ? 'default' : 'outline'}
                  size="lg" 
                  className="w-full"
                  onClick={() => handlePlanClick('large')}
                  disabled={subscription_tier === 'large'}
                >
                  {subscription_tier === 'large' ? 'Current Plan' : 'Start Free Trial'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 max-w-2xl mx-auto bg-muted/50 p-6 rounded-lg text-center">
          <p className="text-muted-foreground">
            <strong className="text-foreground">30-Day Money-Back Guarantee</strong><br />
            Not satisfied? Get a full refund, no questions asked. All plans include free setup and migration assistance.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            {[
              {
                question: "What happens after my free trial?",
                answer: "After 7 days, you'll be automatically charged based on your selected plan: Small Fleet ($20/month), Medium Fleet ($40/month), or Large Fleet ($75/month). You can cancel anytime during or after the trial with no penalty."
              },
              {
                question: "Do you support all IFTA jurisdictions?",
                answer: "Yes! We support all 48 contiguous U.S. states plus the 10 Canadian provinces that participate in IFTA."
              },
              {
                question: "Can I use this for multiple trucks?",
                answer: "Absolutely! Our fleet management tools let you track multiple vehicles and drivers from a single account."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, we use bank-level encryption and security measures. Your data is backed up daily and stored securely in the cloud."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">{faq.question}</h4>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;