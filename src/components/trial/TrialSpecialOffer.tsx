import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Check } from 'lucide-react';

interface TrialOffer {
  id: string;
  offer_type: string;
  discount_percent: number;
  offer_code: string | null;
  offer_expires_at: string | null;
  was_shown: boolean;
  was_accepted: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  offer: TrialOffer | null;
  daysRemaining: number;
  onAccept: (plan: string) => void;
}

const plans = [
  { id: 'solo', name: 'Solo', price: 39, desc: '1 truck — All features' },
  { id: 'small_fleet', name: 'Small Fleet', price: 79, desc: '2-5 trucks — Fleet management' },
  { id: 'fleet_pro', name: 'Fleet Pro', price: 129, desc: '6-10 trucks — Advanced tools' },
];

const TrialSpecialOffer: React.FC<Props> = ({ open, onClose, offer, daysRemaining, onAccept }) => {
  const discount = offer?.discount_percent || 10;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="h-6 w-6 text-primary" /> Special Trial Offer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Upgrade in the next {daysRemaining <= 1 ? 'few hours' : `${daysRemaining} days`} and get{' '}
            <strong className="text-foreground">{discount}% off your first 3 months!</strong>
          </p>

          <div className="space-y-3">
            {plans.map(plan => {
              const discounted = Math.round(plan.price * (1 - discount / 100));
              return (
                <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm line-through text-muted-foreground">${plan.price}</span>
                      <span className="font-bold text-primary">${discounted}/mo</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">x 3 months</Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded bg-amber-50 border border-amber-200">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Offer expires with your trial</span>
          </div>

          <div className="space-y-2">
            {plans.map(plan => {
              const discounted = Math.round(plan.price * (1 - discount / 100));
              return (
                <Button
                  key={plan.id}
                  className="w-full justify-between"
                  variant={plan.id === 'solo' ? 'default' : 'outline'}
                  onClick={() => onAccept(plan.id)}
                >
                  <span>Start {plan.name}</span>
                  <span>${discounted}/mo for 3 months</span>
                </Button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            No thanks, pay full price
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialSpecialOffer;
