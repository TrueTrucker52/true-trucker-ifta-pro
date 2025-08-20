import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  trial_active: boolean;
  trial_days_remaining: number;
  trial_end_date: string | null;
  subscription_status: string;
  loading: boolean;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'free',
    subscription_end: null,
    trial_active: false,
    trial_days_remaining: 0,
    trial_end_date: null,
    subscription_status: 'trial',
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        trial_active: false,
        trial_days_remaining: 0,
        trial_end_date: null,
        subscription_status: 'trial',
        loading: false,
      });
      return;
    }

    try {
      setSubscription(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || 'free',
        subscription_end: data.subscription_end,
        trial_active: data.trial_active || false,
        trial_days_remaining: data.trial_days_remaining || 0,
        trial_end_date: data.trial_end_date,
        subscription_status: data.subscription_status || 'trial',
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        trial_active: false,
        trial_days_remaining: 0,
        trial_end_date: null,
        subscription_status: 'error',
        loading: false,
      });
    }
  };

  const createCheckout = async (plan: string) => {
    console.log('🚀 Creating checkout for plan:', plan);
    if (!user || !session) {
      console.log('❌ No user or session for checkout');
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📡 Invoking create-checkout function with plan:', plan);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Checkout error:', error);
        throw error;
      }

      console.log('✅ Checkout response:', data);
      if (data.url) {
        console.log('🔗 Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        console.error('❌ No checkout URL received');
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('💥 Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscription,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};