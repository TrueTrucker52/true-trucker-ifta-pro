import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star } from "lucide-react";
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
            Professional IFTA tools with smart location auto-complete, trip editing, and Kentucky KYU compliance. Everything active drivers need.
          </p>
        </div>

        {/* Mobile-First Responsive Pricing */}
        <div className="block md:hidden">
          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
            {[
              { name: 'STARTER', price: '$29', trucks: '2', popular: false, plan: 'small' },
              { name: 'PROFESSIONAL', price: '$59', trucks: '10', popular: true, plan: 'medium' },
              { name: 'ENTERPRISE', price: '$129', trucks: 'Unlimited', popular: false, plan: 'large' }
            ].map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-sunset px-4 py-1 rounded-full">
                      <Star className="inline h-4 w-4 text-white mr-1" />
                      <span className="text-white font-semibold text-xs">Most Popular</span>
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>Package</CardDescription>
                  <div className="text-3xl font-bold text-primary mt-2">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Number of Trucks:</span>
                      <span className="font-semibold">{plan.trucks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Number of Trips:</span>
                      <span className="font-semibold">Unlimited</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Number of Quarters:</span>
                      <span className="font-semibold">Unlimited</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-sm font-semibold mb-2">All Features Included:</div>
                    {[
                      'Smart Location Auto-Complete',
                      'Professional Trip Editing',
                      'Kentucky KYU Compliance',
                      'Mobile Trip Entry',
                      'Generate Trip Sheets',
                      'IFTA Quarterly Returns',
                      'Quarterly Mileage Returns',
                      'Recap Reports',
                      'Truck Reports',
                      'Auto Routing & Calculations',
                      'Data Exporting'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant={subscription_tier === plan.plan ? 'default' : plan.popular ? 'hero' : 'outline'}
                    className="w-full mt-4"
                    onClick={() => handlePlanClick(plan.plan)}
                    disabled={subscription_tier === plan.plan}
                  >
                    {subscription_tier === plan.plan ? 'Current Plan' : 'SIGNUP NOW!'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full max-w-5xl mx-auto bg-card rounded-lg shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left"></th>
                  <th className="p-4 text-center">
                    <div className="font-bold text-lg">STARTER</div>
                    <div className="text-sm text-muted-foreground">Package</div>
                  </th>
                  <th className="p-4 text-center relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-sunset px-4 py-1 rounded-full">
                        <Star className="inline h-4 w-4 text-white mr-1" />
                        <span className="text-white font-semibold text-xs">Most Popular</span>
                      </div>
                    </div>
                    <div className="font-bold text-lg pt-4">PROFESSIONAL</div>
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
                  <td className="p-4 text-center font-bold text-2xl text-primary">$29</td>
                  <td className="p-4 text-center font-bold text-2xl text-primary">$59</td>
                  <td className="p-4 text-center font-bold text-2xl text-primary">$129</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Number of Trucks:</td>
                  <td className="p-4 text-center">2</td>
                  <td className="p-4 text-center">10</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Number of Trips:</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Number of Quarters:</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                {[
                  'Smart Location Auto-Complete',
                  'Professional Trip Editing',
                  'Kentucky KYU Compliance',
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
                  </tr>
                ))}
                <tr>
                  <td className="p-4"></td>
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
                      variant={subscription_tier === 'medium' ? 'default' : 'hero'}
                      className="w-full"
                      onClick={() => handlePlanClick('medium')}
                      disabled={subscription_tier === 'medium'}
                    >
                      {subscription_tier === 'medium' ? 'Current Plan' : 'SIGNUP NOW!'}
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
                </tr>
              </tbody>
            </table>
          </div>
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
                 answer: "You'll be charged monthly based on your selected plan: Starter ($29/month), Professional ($59/month), or Enterprise ($129/month). You can cancel anytime with no penalty."
              },
              {
                question: "Do you support all IFTA jurisdictions?",
                answer: "Yes! We support all 48 contiguous U.S. states plus the 10 Canadian provinces that participate in IFTA."
              },
               {
                 question: "What makes this different from basic mileage trackers?",
                 answer: "Our professional tools include smart location auto-complete with 100+ trucking destinations, full trip editing capabilities, Kentucky KYU compliance, and advanced IFTA calculations. Built specifically for active drivers, not casual users."
               },
               {
                 question: "Can I use this for multiple trucks?",
                 answer: "Absolutely! Our fleet management tools let you track multiple vehicles and drivers from a single account with individual trip tracking and consolidated reporting."
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