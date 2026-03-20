import React from 'react';
import { Button } from '@/components/ui/button';
import { useReferrals } from '@/hooks/useReferrals';
import { useNavigate } from 'react-router-dom';
import { Gift, Copy } from 'lucide-react';

const ReferralWidget: React.FC = () => {
  const { referralCode, copyCode, stats } = useReferrals();
  const navigate = useNavigate();

  if (!referralCode) return null;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20">
      <div className="flex items-center gap-3">
        <Gift className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Refer a trucker — earn 1 free month!
          </p>
          <p className="text-xs text-muted-foreground">
            Your code: <span className="font-mono font-bold text-primary">{referralCode}</span>
            {stats.convertedCount > 0 && ` · ${stats.convertedCount} converted`}
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyCode}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => navigate('/referrals')} className="gap-1">
          Share Now →
        </Button>
      </div>
    </div>
  );
};

export default ReferralWidget;
