import React from 'react';
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { OptimizedLoadingState } from '@/components/OptimizedLoadingState';

interface CompanySetupGuardProps {
  children: React.ReactNode;
  feature: string;
}

export const CompanySetupGuard: React.FC<CompanySetupGuardProps> = ({ 
  children, 
  feature
}) => {
  const { user, profile, profileLoading } = useAuth();
  const { subscribed, trial_active, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Only enforce setup once the user is signed in AND has access to gated features (trial or subscription).
  const shouldEnforceSetup = !!user && (subscribed || trial_active);
  const needsSetup = shouldEnforceSetup && !profile?.company_setup_completed;

  if (!shouldEnforceSetup) {
    return <>{children}</>;
  }

  if (subscriptionLoading || profileLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <OptimizedLoadingState message="Checking company setup..." />
      </div>
    );
  }

  // Allow access if no setup needed
  if (!needsSetup) {
    return <>{children}</>;
  }

  // Show setup required message
  return (
    <div className="relative">
      {/* Blur the content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Overlay with setup message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <Card className="max-w-md mx-auto shadow-xl bg-card/95 backdrop-blur-sm border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">
              Complete Company Setup Required
            </CardTitle>
            <CardDescription className="text-center">
              To access {feature}, please complete your company information setup first.
              This ensures accurate IFTA reporting and compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/account?flow=setup')}
                className="w-full"
                size="lg"
              >
                <Building className="h-4 w-4 mr-2" />
                Complete Company Setup
              </Button>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Required information includes:</strong><br />
                  Company details, DOT number, physical address, and carrier information
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};