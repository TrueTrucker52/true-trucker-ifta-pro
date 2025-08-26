import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  ArrowRight,
  Truck,
  BarChart3,
  Settings
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface BOLUpgradeIncentiveProps {
  variant?: 'card' | 'banner' | 'modal';
  showIf?: 'free' | 'trial' | 'starter' | 'always';
}

export const BOLUpgradeIncentive = ({ 
  variant = 'card', 
  showIf = 'always' 
}: BOLUpgradeIncentiveProps) => {
  const { subscription_tier, createCheckout, openCustomerPortal, subscribed } = useSubscription();
  const navigate = useNavigate();

  // Determine if we should show the incentive
  const shouldShow = () => {
    switch (showIf) {
      case 'free':
        return subscription_tier === 'free';
      case 'trial':
        return subscription_tier === 'free' || !subscribed;
      case 'starter':
        return subscription_tier === 'free' || subscription_tier === 'small';
      case 'always':
      default:
        return true;
    }
  };

  if (!shouldShow()) return null;

  const currentTier = subscription_tier || 'free';
  
  const incentiveData = {
    free: {
      title: "Unlock Professional BOL Management",
      description: "Transform your freight operations with AI-powered BOL tools",
      targetPlan: 'medium',
      targetPlanName: 'Professional',
      price: 59,
      savings: "Save 15+ hours per month",
      features: [
        { icon: Zap, text: "AI-powered BOL scanning & data extraction" },
        { icon: Users, text: "Multi-vehicle fleet coordination" },
        { icon: BarChart3, text: "Revenue tracking & profitability analysis" },
        { icon: Shield, text: "Automated compliance monitoring" }
      ]
    },
    small: {
      title: "Upgrade to Advanced Fleet BOL",
      description: "Scale your operations with enterprise-grade BOL management",
      targetPlan: 'medium',
      targetPlanName: 'Professional',
      price: 59,
      savings: "Coordinate up to 10 vehicles",
      features: [
        { icon: TrendingUp, text: "Advanced BOL analytics & reporting" },
        { icon: Settings, text: "Automated BOL processing workflows" },
        { icon: Truck, text: "Fleet-wide load optimization" },
        { icon: FileText, text: "Customer portal integration" }
      ]
    },
    medium: {
      title: "Enterprise BOL Solutions",
      description: "Complete BOL lifecycle management for large fleets",
      targetPlan: 'large',
      targetPlanName: 'Enterprise',
      price: 129,
      savings: "Unlimited vehicles & custom integrations",
      features: [
        { icon: Settings, text: "Custom BOL templates & branding" },
        { icon: Shield, text: "Enterprise security & compliance" },
        { icon: Users, text: "Dedicated BOL support specialist" },
        { icon: Zap, text: "API integration with TMS/ERP systems" }
      ]
    }
  };

  const data = incentiveData[currentTier as keyof typeof incentiveData] || incentiveData.free;

  const handleUpgrade = () => {
    if (subscribed) {
      openCustomerPortal();
    } else {
      createCheckout(data.targetPlan);
    }
  };

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{data.title}</h4>
              <p className="text-xs text-muted-foreground">{data.savings}</p>
            </div>
          </div>
          <Button size="sm" onClick={handleUpgrade}>
            Upgrade <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              {data.savings}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {data.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-2">
            <Button className="w-full" onClick={handleUpgrade}>
              Upgrade to {data.targetPlanName} - ${data.price}/month
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/pricing')}
            >
              View All Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default card variant
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{data.title}</CardTitle>
              <CardDescription className="mt-1">{data.description}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{data.savings}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {data.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1" onClick={handleUpgrade}>
            Upgrade to {data.targetPlanName}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/pricing')}
          >
            View Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};