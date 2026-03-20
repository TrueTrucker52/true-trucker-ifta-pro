import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Rocket } from 'lucide-react';

interface Props {
  planName: string;
  price: number;
  onDismiss: () => void;
}

const UpgradeSuccessCelebration: React.FC<Props> = ({ planName, price, onDismiss }) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    'Unlimited IFTA reports',
    'Full ELD compliance',
    'Live GPS tracking',
    'Voice commands',
    'BOL scanning unlimited',
    'AI assistant TruckerAI',
    'Priority support',
  ];

  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][i % 5],
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ y: '100vh', opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">Welcome to TrueTrucker!</h1>
        <Badge className="text-sm px-4 py-1">
          <Rocket className="h-4 w-4 mr-1" /> {planName} Plan
        </Badge>

        <div className="text-left space-y-2 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-3">Here's what you just unlocked:</p>
          {features.map(f => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          Next billing date: {nextBilling.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} — ${price}.00
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => { onDismiss(); navigate('/dashboard'); }}
        >
          Go to Dashboard 🚛
        </Button>
      </motion.div>
    </div>
  );
};

export default UpgradeSuccessCelebration;
