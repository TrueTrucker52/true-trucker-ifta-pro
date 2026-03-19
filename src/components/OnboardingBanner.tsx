import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';

const TOTAL_STEPS = 7;

export const OnboardingBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [stepsRemaining, setStepsRemaining] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const check = async () => {
      const { data } = await supabase
        .from('driver_onboarding')
        .select('step_completed, is_complete')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        // No onboarding record = brand new user
        setShow(true);
        setStepsRemaining(TOTAL_STEPS);
      } else if (!data.is_complete) {
        setShow(true);
        setStepsRemaining(TOTAL_STEPS - data.step_completed);
      }
    };
    check();
  }, [user?.id]);

  if (!show || dismissed) return null;

  return (
    <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">
            ⚠️ Finish setting up your account to unlock all features
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stepsRemaining} steps remaining — about {Math.max(1, stepsRemaining)} min left
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Button size="sm" onClick={() => navigate('/onboarding')}>
            Continue Setup <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
