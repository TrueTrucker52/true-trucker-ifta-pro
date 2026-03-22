import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { hasActiveEldAddon } from '@/lib/eldUpgrade';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { checkSubscription, loading, eld_active, eld_status } = useSubscription();
  const [isVerifying, setIsVerifying] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (sessionId && session?.access_token) {
          await supabase.functions.invoke('sync-eld-checkout', {
            body: { sessionId },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1200));
        
        await checkSubscription();
        
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated. Welcome to TrueTrucker IFTA Pro!",
          variant: "default"
        });
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Payment Processing",
          description: "We're verifying your payment. This may take a few moments.",
          variant: "default"
        });
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [user, session?.access_token, navigate, checkSubscription, toast, searchParams]);

  const handleContinue = () => {
    navigate(hasActiveEldAddon(eld_status, eld_active) ? '/eld' : '/account?flow=setup');
  };

  const isEldActivated = hasActiveEldAddon(eld_status, eld_active);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isVerifying ? "Processing Payment..." : isEldActivated ? '🎉 ELD Compliance Activated!' : "Welcome to TrueTrucker IFTA Pro!"}
          </CardTitle>
          <CardDescription>
            {isVerifying 
              ? "We're activating your subscription. Please wait a moment."
              : isEldActivated
                ? 'Your account now has full FMCSA certified ELD compliance.'
                : "Your subscription is active! Please complete your business information to begin your IFTA journey."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerifying && (
            <>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                {isEldActivated ? (
                  <>
                    <h3 className="mb-2 font-semibold text-green-800">You are now protected against:</h3>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>✓ $16,000 ELD violation fines</li>
                      <li>✓ DOT out of service orders</li>
                      <li>✓ Failed inspection records</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-green-800 mb-2">Your subscription includes:</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ Unlimited IFTA calculations</li>
                      <li>✓ Receipt scanning & management</li>
                      <li>✓ Automated report generation</li>
                      <li>✓ Multi-vehicle tracking</li>
                      <li>✓ Premium support</li>
                    </ul>
                  </>
                )}
              </div>
              <Button 
                onClick={handleContinue} 
                className="w-full"
                size="lg"
              >
                {isEldActivated ? '⚖️ Open ELD Dashboard' : 'Complete Company Setup'}
              </Button>
              {isEldActivated && (
                <Button variant="outline" onClick={() => navigate('/eld')} className="w-full">
                  📋 Set Up Your First Log
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;