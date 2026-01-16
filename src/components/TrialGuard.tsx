import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface TrialGuardProps {
  children: React.ReactNode;
  feature: string;
  requiredTier?: 'small' | 'medium' | 'large';
}

export const TrialGuard: React.FC<TrialGuardProps> = ({ 
  children, 
  feature, 
  requiredTier = 'small'
}) => {
  const { 
    trial_active, 
    trial_days_remaining, 
    subscription_status, 
    subscribed,
    subscription_tier,
    createCheckout,
    isAdmin
  } = useSubscription();
  const navigate = useNavigate();

  // Admins always have full access
  if (isAdmin) {
    return <>{children}</>;
  }

  // Allow access if user has active subscription of required tier or higher
  if (subscribed) {
    const tierHierarchy = ['small', 'medium', 'large', 'admin'];
    const userTierIndex = tierHierarchy.indexOf(subscription_tier || '');
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    
    if (userTierIndex >= requiredTierIndex) {
      return <>{children}</>;
    }
  }

  // Allow access if trial is active
  if (trial_active) {
    return <>{children}</>;
  }

  // Show trial expired or upgrade required messaging
  const isTrialExpired = subscription_status === 'trial_expired';
  
  return (
    <div className="relative">
      {/* Blur the content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Overlay with upgrade message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <Card className="max-w-md mx-auto shadow-xl bg-card/95 backdrop-blur-sm border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                {isTrialExpired ? (
                  <Clock className="h-8 w-8 text-primary" />
                ) : (
                  <Lock className="h-8 w-8 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-xl">
              {isTrialExpired ? 'Free Trial Ended' : `${feature} Requires Subscription`}
            </CardTitle>
            <CardDescription className="text-center">
              {isTrialExpired ? (
                <>
                  Your 7-day free trial has ended. Subscribe to continue using all IFTA features.
                </>
              ) : (
                <>
                  This feature requires a {requiredTier} plan or higher. 
                  {trial_active && (
                    <> You have {trial_days_remaining} days left in your trial.</>
                  )}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => createCheckout(requiredTier)}
                className="w-full"
                size="lg"
              >
                <Star className="h-4 w-4 mr-2" />
                {isTrialExpired ? 'Subscribe Now' : `Upgrade to ${requiredTier}`}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const pricingElement = document.getElementById('pricing');
                  if (pricingElement) {
                    pricingElement.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/#pricing');
                  }
                }}
                className="w-full"
                size="sm"
              >
                View All Plans
              </Button>
            </div>
            
            {isTrialExpired && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  🎉 <strong>What you experienced during your trial:</strong><br />
                  Full access to mileage tracking, receipt scanning, IFTA calculations, and quarterly reports
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};