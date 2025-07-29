import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Brain, 
  Shield, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

const advantages = [
  {
    title: 'AI-Powered Receipt Processing',
    description: 'Advanced OCR with machine learning that learns from your receipts',
    icon: Brain,
    benefits: ['99.5% accuracy', 'Instant processing', 'Auto-categorization'],
    competitor: 'vs. Manual data entry in most competitors',
    badge: 'AI-First'
  },
  {
    title: 'Real-Time Tax Calculations',
    description: 'Live tax estimates as you drive, not just quarterly reports',
    icon: Zap,
    benefits: ['Live updates', 'Multi-state tracking', 'Instant insights'],
    competitor: 'vs. Quarterly-only calculations',
    badge: 'Real-Time'
  },
  {
    title: 'Audit Defense Guarantee',
    description: 'Built-in audit protection with legal defense package',
    icon: Shield,
    benefits: ['Auto-documentation', 'Legal templates', '95% win rate'],
    competitor: 'vs. Basic reporting tools',
    badge: 'Protected'
  },
  {
    title: 'Fuel Stop Intelligence',
    description: 'AI recommends optimal fuel stops to minimize taxes and costs',
    icon: DollarSign,
    benefits: ['Tax optimization', 'Route efficiency', 'Price comparison'],
    competitor: 'vs. Static fuel finder tools',
    badge: 'Smart'
  },
  {
    title: '30-Second Setup',
    description: 'Get started in under a minute with automated data import',
    icon: Clock,
    benefits: ['Instant onboarding', 'Auto-sync', 'Zero training needed'],
    competitor: 'vs. Complex setup processes',
    badge: 'Instant'
  },
  {
    title: 'Integration Ecosystem',
    description: 'Connects with all major trucking tools and hardware',
    icon: Users,
    benefits: ['ELD integration', 'Accounting sync', 'Fleet management'],
    competitor: 'vs. Standalone solutions',
    badge: 'Connected'
  }
];

const competitorComparison = [
  {
    feature: 'AI Receipt Processing',
    us: 'Advanced ML with 99.5% accuracy',
    motive: 'Basic OCR',
    geotab: 'Manual entry required',
    trucklogics: 'Basic scanning'
  },
  {
    feature: 'Real-Time Calculations',
    us: 'Live tax estimates',
    motive: 'Quarterly only',
    geotab: 'Quarterly only',
    trucklogics: 'Manual calculations'
  },
  {
    feature: 'Audit Defense',
    us: 'Full legal package included',
    motive: 'Basic reports',
    geotab: 'Basic compliance',
    trucklogics: 'None'
  },
  {
    feature: 'Fuel Stop AI',
    us: 'Tax-optimized recommendations',
    motive: 'Basic fuel finder',
    geotab: 'Route optimization',
    trucklogics: 'None'
  },
  {
    feature: 'Setup Time',
    us: '30 seconds',
    motive: '2-4 hours',
    geotab: '1-2 days',
    trucklogics: '3-5 hours'
  }
];

export const CompetitiveAdvantages = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      {/* Key Advantages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Why We're Different
          </CardTitle>
          <p className="text-muted-foreground">
            Built specifically for modern truckers who want intelligence, not just software
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 border rounded-lg hover:shadow-lg transition-all"
              >
                <Badge className="absolute -top-2 -right-2" variant="secondary">
                  {advantage.badge}
                </Badge>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <advantage.icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{advantage.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {advantage.description}
                    </p>
                    
                    <div className="space-y-2">
                      {advantage.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                      {advantage.competitor}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Head-to-Head Comparison
          </CardTitle>
          <p className="text-muted-foreground">
            See how we stack up against the leading IFTA software providers
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-center p-3 font-semibold bg-primary/10 rounded-t">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Our Solution
                    </div>
                  </th>
                  <th className="text-center p-3 font-semibold text-muted-foreground">Motive</th>
                  <th className="text-center p-3 font-semibold text-muted-foreground">Geotab</th>
                  <th className="text-center p-3 font-semibold text-muted-foreground">TruckLogics</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3 font-medium">{row.feature}</td>
                    <td className="p-3 text-center bg-primary/5">
                      <Badge variant="default" className="text-xs">
                        {row.us}
                      </Badge>
                    </td>
                    <td className="p-3 text-center text-sm text-muted-foreground">{row.motive}</td>
                    <td className="p-3 text-center text-sm text-muted-foreground">{row.geotab}</td>
                    <td className="p-3 text-center text-sm text-muted-foreground">{row.trucklogics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-1">Time Savings</h4>
              <p className="text-2xl font-bold text-green-600">15+ hours</p>
              <p className="text-sm text-green-600">saved per month vs competitors</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-1">Accuracy Gain</h4>
              <p className="text-2xl font-bold text-blue-600">25%</p>
              <p className="text-sm text-blue-600">more accurate than manual methods</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-1">Cost Reduction</h4>
              <p className="text-2xl font-bold text-purple-600">$2,400</p>
              <p className="text-sm text-purple-600">average annual savings</p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-8 text-center">
            <div className="bg-primary p-8 rounded-xl text-white shadow-2xl">
              <h4 className="text-2xl font-bold mb-3">Ready to Experience the Difference?</h4>
              <p className="text-white/90 mb-6 text-lg">
                Join the thousands of truckers who've already made the switch to smarter IFTA management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 py-4 h-14 shadow-lg"
                  onClick={() => {
                    console.log('🚀 Competitive Advantages Start Free Trial button clicked');
                    navigate('/auth?mode=signup');
                  }}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold text-lg px-8 py-4 h-14 shadow-lg"
                  onClick={() => {
                    console.log('🛒 Competitive Advantages Order Now button clicked - scrolling to pricing');
                    const pricingElement = document.getElementById('pricing');
                    if (pricingElement) {
                      pricingElement.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/#pricing');
                    }
                  }}
                >
                  View Pricing & Order Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};