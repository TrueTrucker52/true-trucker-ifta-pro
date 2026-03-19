import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingState {
  id: string | null;
  stepCompleted: number;
  isComplete: boolean;
  skippedSteps: number[];
  onboardingType: string;
  loading: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    id: null,
    stepCompleted: 0,
    isComplete: false,
    skippedSteps: [],
    onboardingType: 'driver',
    loading: true,
  });

  const loadOnboarding = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const { data, error } = await supabase
      .from('driver_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load onboarding:', error);
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    if (data) {
      setState({
        id: data.id,
        stepCompleted: data.step_completed,
        isComplete: data.is_complete,
        skippedSteps: (data.skipped_steps as number[]) || [],
        onboardingType: data.onboarding_type,
        loading: false,
      });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  const initOnboarding = async (type: string = 'driver') => {
    if (!user?.id) return;

    const deviceType = /iPhone|iPad|iPod/.test(navigator.userAgent)
      ? 'ios'
      : /Android/.test(navigator.userAgent)
      ? 'android'
      : 'desktop';

    const { data, error } = await supabase
      .from('driver_onboarding')
      .upsert({
        user_id: user.id,
        step_completed: 0,
        is_complete: false,
        skipped_steps: [],
        device_type: deviceType,
        onboarding_type: type,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      setState({
        id: data.id,
        stepCompleted: 0,
        isComplete: false,
        skippedSteps: [],
        onboardingType: type,
        loading: false,
      });
    }
  };

  const completeStep = async (step: number) => {
    if (!user?.id) return;
    const newStep = Math.max(state.stepCompleted, step);

    await supabase
      .from('driver_onboarding')
      .update({ step_completed: newStep, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    setState(prev => ({ ...prev, stepCompleted: newStep }));
  };

  const skipStep = async (step: number) => {
    if (!user?.id) return;
    const newSkipped = [...new Set([...state.skippedSteps, step])];
    const newStep = Math.max(state.stepCompleted, step);

    await supabase
      .from('driver_onboarding')
      .update({
        step_completed: newStep,
        skipped_steps: newSkipped,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setState(prev => ({
      ...prev,
      stepCompleted: newStep,
      skippedSteps: newSkipped,
    }));
  };

  const finishOnboarding = async () => {
    if (!user?.id) return;

    await supabase
      .from('driver_onboarding')
      .update({
        is_complete: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setState(prev => ({ ...prev, isComplete: true }));
  };

  return {
    ...state,
    initOnboarding,
    completeStep,
    skipStep,
    finishOnboarding,
    reload: loadOnboarding,
  };
};
