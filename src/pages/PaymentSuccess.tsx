import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkSubscription, loading } = useSubscription();
  const [isVerifying, setIsVerifying] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Wait a moment for Stripe to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check subscription status
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
  }, [user, navigate, checkSubscription, toast]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

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
            {isVerifying ? "Processing Payment..." : "Welcome to TrueTrucker IFTA Pro!"}
          </CardTitle>
          <CardDescription>
            {isVerifying 
              ? "We're activating your subscription. Please wait a moment."
              : "Your payment was successful and your account has been upgraded."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerifying && (
            <>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Your subscription includes:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Unlimited IFTA calculations</li>
                  <li>✓ Receipt scanning & management</li>
                  <li>✓ Automated report generation</li>
                  <li>✓ Multi-vehicle tracking</li>
                  <li>✓ Premium support</li>
                </ul>
              </div>
              <Button 
                onClick={handleContinue} 
                className="w-full"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;