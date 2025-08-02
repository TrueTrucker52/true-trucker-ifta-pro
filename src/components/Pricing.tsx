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
    console.log('🎯 Plan clicked:', plan, 'User authenticated:', !!user);
    if (!user) {
      console.log('🔄 Redirecting to auth - no user');
      navigate('/auth');
    } else {
      console.log('💳 Creating checkout for authenticated user');
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

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full max-w-7xl mx-auto bg-card rounded-lg shadow-lg">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left"></th>
                <th className="p-4 text-center">
                  <div className="font-bold text-lg">OWNER-OPERATOR</div>
                  <div className="text-sm text-muted-foreground">Package</div>
                </th>
                <th className="p-4 text-center">
                  <div className="font-bold text-lg">SMALL</div>
                  <div className="text-sm text-muted-foreground">Package</div>
                </th>
                <th className="p-4 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-sunset px-4 py-1 rounded-full">
                      <Star className="inline h-4 w-4 text-white mr-1" />
                      <span className="text-white font-semibold text-xs">Most Popular</span>
                    </div>
                  </div>
                  <div className="font-bold text-lg pt-4">INTERMEDIATE</div>
                  <div className="text-sm text-muted-foreground">Package</div>
                </th>
                <th className="p-4 text-center">
                  <div className="font-bold text-lg">LARGE</div>
                  <div className="text-sm text-muted-foreground">Package</div>
                </th>
                <th className="p-4 text-center">
                  <div className="font-bold text-lg">ENTERPRISE</div>
                  <div className="text-sm text-muted-foreground">Package</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-muted/20">
                <td className="p-4 font-semibold">Monthly Fee:</td>
                <td className="p-4 text-center font-bold text-2xl text-primary">$19.99</td>
                <td className="p-4 text-center font-bold text-2xl text-primary">$29.99</td>
                <td className="p-4 text-center font-bold text-2xl text-primary">$39.99</td>
                <td className="p-4 text-center font-bold text-2xl text-primary">$59.99</td>
                <td className="p-4 text-center font-bold text-2xl text-primary">$99.99</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Number of Trucks:</td>
                <td className="p-4 text-center">2</td>
                <td className="p-4 text-center">5</td>
                <td className="p-4 text-center">10</td>
                <td className="p-4 text-center">25</td>
                <td className="p-4 text-center">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Number of Trips:</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Number of Quarters:</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
                <td className="p-4 text-center">Unlimited</td>
              </tr>
              {[
                'Mobile Trip Entry',
                'Generate Trip Sheets',
                'IFTA Quarterly Returns',
                'Quarterly Mileage Returns',
                'Recap Reports',
                'Truck Reports',
                'Auto Routing & Calculations',
                'Data Exporting'
              ].map((feature) => (
                <tr key={feature} className="border-b">
                  <td className="p-4 font-semibold">{feature}:</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-success mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-success mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-success mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-success mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="h-5 w-5 text-success mx-auto" />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="p-4"></td>
                <td className="p-4 text-center">
                  <Button 
                    variant={subscription_tier === 'owner-operator' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanClick('owner-operator')}
                    disabled={subscription_tier === 'owner-operator'}
                  >
                    {subscription_tier === 'owner-operator' ? 'Current Plan' : 'SIGNUP NOW!'}
                  </Button>
                </td>
                <td className="p-4 text-center">
                  <Button 
                    variant={subscription_tier === 'small' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanClick('small')}
                    disabled={subscription_tier === 'small'}
                  >
                    {subscription_tier === 'small' ? 'Current Plan' : 'SIGNUP NOW!'}
                  </Button>
                </td>
                <td className="p-4 text-center">
                  <Button 
                    variant={subscription_tier === 'intermediate' ? 'default' : 'hero'}
                    className="w-full"
                    onClick={() => handlePlanClick('intermediate')}
                    disabled={subscription_tier === 'intermediate'}
                  >
                    {subscription_tier === 'intermediate' ? 'Current Plan' : 'SIGNUP NOW!'}
                  </Button>
                </td>
                <td className="p-4 text-center">
                  <Button 
                    variant={subscription_tier === 'large' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanClick('large')}
                    disabled={subscription_tier === 'large'}
                  >
                    {subscription_tier === 'large' ? 'Current Plan' : 'SIGNUP NOW!'}
                  </Button>
                </td>
                <td className="p-4 text-center">
                  <Button 
                    variant={subscription_tier === 'enterprise' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => handlePlanClick('enterprise')}
                    disabled={subscription_tier === 'enterprise'}
                  >
                    {subscription_tier === 'enterprise' ? 'Current Plan' : 'SIGNUP NOW!'}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            The security of our checkout process and your personal information has been tested by 3rd party entities and is 100% secure.
          </p>
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
                 question: "How does billing work?",
                 answer: "You'll be charged monthly based on your selected plan: Owner-Operator ($19.99/month), Small ($29.99/month), Intermediate ($39.99/month), Large ($59.99/month), or Enterprise ($99.99/month). You can cancel anytime with no penalty."
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