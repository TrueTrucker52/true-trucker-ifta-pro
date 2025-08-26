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
          {/* Urgency Banner */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-semibold">🔥 FLEET EXPANSION SPECIAL</span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <p className="text-sm text-red-700">89% of solo drivers upgrade to fleet management within 60 days • Don't get left behind</p>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            From Solo Driver to
            <span className="block text-primary">Fleet Owner</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Stop limiting yourself to one truck. Scale your operation with professional fleet management tools.
          </p>
          
          {/* Social Proof */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-green-700 font-semibold text-sm">💰 10,000+ drivers scaled • Average: +$2,500/month within 90 days</p>
          </div>
        </div>

        {/* Mobile-First Responsive Pricing */}
        <div className="block md:hidden">
          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
            {[
              { name: 'SOLO DRIVER', price: '$25', trucks: '2 Only', popular: false, plan: 'small', warning: '⚠️ Limited Growth' },
              { name: 'FLEET MANAGER', price: '$49', trucks: '10 Trucks', popular: true, plan: 'medium', badge: '🚀 SCALE NOW' },
              { name: 'FLEET EMPIRE', price: '$99', trucks: 'Unlimited', popular: false, plan: 'large', badge: '💎 UNLIMITED' }
            ].map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary scale-105 shadow-xl' : ''} hover:shadow-lg transition-all duration-300`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-1 rounded-full animate-pulse">
                      <Star className="inline h-4 w-4 text-white mr-1" />
                      <span className="text-white font-semibold text-xs">{plan.badge}</span>
                    </div>
                  </div>
                )}
                
                {plan.warning && (
                  <div className="absolute top-4 right-4 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                    <span className="text-red-600 text-xs font-semibold">{plan.warning}</span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className={`text-lg ${plan.popular ? 'text-primary' : ''}`}>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.plan === 'small' ? '⚠️ Growth Limited' : 
                     plan.plan === 'medium' ? '🚛 Fleet Ready' : 
                     '🏢 Enterprise Level'}
                  </CardDescription>
                  <div className="text-3xl font-bold text-primary mt-2">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                  <div className="text-xs text-green-600 font-semibold mt-1">7-day free trial</div>
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
                    className={`w-full mt-4 ${plan.popular ? 'animate-pulse' : ''}`}
                    onClick={() => handlePlanClick(plan.plan)}
                    disabled={subscription_tier === plan.plan}
                  >
                    {subscription_tier === plan.plan ? 'Current Plan' : 
                      plan.plan === 'small' ? 'START SOLO' :
                      plan.plan === 'medium' ? '🚀 SCALE TO FLEET' : 
                      '💎 BUILD EMPIRE'
                    }
                  </Button>
                  
                  {plan.popular && (
                    <p className="text-xs text-green-600 font-semibold mt-2 text-center">
                      ⚡ Start earning more in 5 minutes
                    </p>
                  )}
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
                  <td className="p-4 text-center">
                    <div className="font-bold text-2xl text-primary">$25</div>
                    <div className="text-xs text-green-600 font-semibold">7-day free trial</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-bold text-2xl text-primary">$49</div>
                    <div className="text-xs text-green-600 font-semibold">7-day free trial</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-bold text-2xl text-primary">$99</div>
                    <div className="text-xs text-green-600 font-semibold">7-day free trial</div>
                  </td>
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
                 answer: "7-day free trial, then $25/month for Starter (2 trucks), $49/month for Professional (10 trucks), or $99/month for Enterprise (unlimited trucks). You can cancel anytime with no penalty."
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