import { motion } from "framer-motion";
import { Clock, Star, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

export const TrialBanner = () => {
  const { 
    trial_active, 
    trial_days_remaining, 
    subscription_status, 
    subscribed,
    createCheckout 
  } = useSubscription();
  const navigate = useNavigate();

  // Don't show banner if user has active subscription
  if (subscribed) return null;

  // Don't show banner if trial expired (show different messaging in pages)
  if (subscription_status === 'trial_expired') return null;

  // Only show for active trials
  if (!trial_active) return null;

  const getTrialMessage = () => {
    if (trial_days_remaining === 1) {
      return "Last day of your free trial!";
    } else if (trial_days_remaining <= 3) {
      return `Only ${trial_days_remaining} days left in your free trial`;
    } else {
      return `${trial_days_remaining} days remaining in your free trial`;
    }
  };

  const getVariant = () => {
    if (trial_days_remaining === 1) return "destructive";
    if (trial_days_remaining <= 3) return "default";
    return "secondary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {getTrialMessage()}
              </p>
              <p className="text-sm text-muted-foreground">
                Full access to all IFTA features • No credit card required
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const pricingElement = document.getElementById('pricing');
                if (pricingElement) {
                  pricingElement.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#pricing');
                }
              }}
            >
              View Plans
            </Button>
            <Button
              variant={getVariant()}
              size="sm"
              onClick={() => createCheckout('medium')}
              className="font-semibold"
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};