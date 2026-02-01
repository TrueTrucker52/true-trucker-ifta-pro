import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminRole } from '@/hooks/useAdminRole';

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000;

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  trial_active: boolean;
  trial_days_remaining: number;
  trial_end_date: string | null;
  subscription_status: string;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'free',
    subscription_end: null,
    trial_active: false,
    trial_days_remaining: 0,
    trial_end_date: null,
    subscription_status: 'trial',
    loading: true,
    error: null,
  });
  
  const retryCountRef = useRef(0);
  const isFetchingRef = useRef(false);
  const hasCheckedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // If user is admin, always return subscribed status
  useEffect(() => {
    if (!adminLoading && isAdmin && mountedRef.current) {
      hasCheckedRef.current = true;
      retryCountRef.current = MAX_RETRY_COUNT; // Prevent retries for admin
      setSubscription({
        subscribed: true,
        subscription_tier: 'admin',
        subscription_end: null,
        trial_active: false,
        trial_days_remaining: 0,
        trial_end_date: null,
        subscription_status: 'admin',
        loading: false,
        error: null,
      });
    }
  }, [isAdmin, adminLoading]);

  const checkSubscription = useCallback(async () => {
    // Skip if admin (already handled by useEffect above)
    if (isAdmin) return;
    
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }
    
    // Skip if already checked for this user
    if (hasCheckedRef.current && lastUserIdRef.current === user?.id) {
      return;
    }
    
    // Check retry limit
    if (retryCountRef.current >= MAX_RETRY_COUNT && hasCheckedRef.current) {
      return;
    }
    
    if (!user || !session) {
      if (mountedRef.current) {
        setSubscription({
          subscribed: false,
          subscription_tier: 'free',
          subscription_end: null,
          trial_active: false,
          trial_days_remaining: 0,
          trial_end_date: null,
          subscription_status: 'trial',
          loading: false,
          error: null,
        });
      }
      return;
    }

    try {
      isFetchingRef.current = true;
      lastUserIdRef.current = user.id;
      
      // Only set loading on first check, not retries
      if (!hasCheckedRef.current && mountedRef.current) {
        setSubscription(prev => ({ ...prev, loading: true, error: null }));
      }
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!mountedRef.current) return;

      if (error) {
        // Check if it's an authentication error
        if (error.message?.includes('Authentication error') || error.message?.includes('Session')) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            toast({
              title: "Authentication Error",
              description: "Please sign out and sign back in to refresh your session.",
              variant: "destructive"
            });
            throw refreshError;
          }
          
          // Retry with refreshed session
          const retryResponse = await supabase.functions.invoke('check-subscription', {
            headers: {
              Authorization: `Bearer ${refreshData.session?.access_token}`,
            },
          });
          
          if (retryResponse.error) throw retryResponse.error;
          if (!mountedRef.current) return;
          
          hasCheckedRef.current = true;
          retryCountRef.current = 0;
          setSubscription({
            subscribed: retryResponse.data.subscribed || false,
            subscription_tier: retryResponse.data.subscription_tier || 'free',
            subscription_end: retryResponse.data.subscription_end,
            trial_active: retryResponse.data.trial_active || false,
            trial_days_remaining: retryResponse.data.trial_days_remaining || 0,
            trial_end_date: retryResponse.data.trial_end_date,
            subscription_status: retryResponse.data.subscription_status || 'trial',
            loading: false,
            error: null,
          });
          return;
        }
        throw error;
      }

      hasCheckedRef.current = true;
      retryCountRef.current = 0;
      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || 'free',
        subscription_end: data.subscription_end,
        trial_active: data.trial_active || false,
        trial_days_remaining: data.trial_days_remaining || 0,
        trial_end_date: data.trial_end_date,
        subscription_status: data.subscription_status || 'trial',
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Subscription check failed:', errorMessage);
      
      retryCountRef.current += 1;
      hasCheckedRef.current = true;
      
      if (!mountedRef.current) return;
      
      // Set error state
      setSubscription(prev => ({
        ...prev,
        subscribed: false,
        subscription_tier: 'free',
        subscription_status: 'error',
        loading: false,
        error: retryCountRef.current >= MAX_RETRY_COUNT 
          ? `Failed after ${MAX_RETRY_COUNT} attempts` 
          : errorMessage,
      }));

      // Only retry if under limit and not a permanent error
      if (retryCountRef.current < MAX_RETRY_COUNT && !errorMessage.includes('Unauthorized')) {
        setTimeout(() => {
          isFetchingRef.current = false;
          if (mountedRef.current) {
            checkSubscription();
          }
        }, RETRY_DELAY_MS);
        return;
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [user?.id, session?.access_token, isAdmin, toast]);

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
    console.log('🚀 Opening customer portal');
    if (!user || !session) {
      console.log('❌ No user or session for customer portal');
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📡 Invoking customer-portal function');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Customer portal error:', error);
        throw error;
      }

      console.log('✅ Customer portal response:', data);
      if (data.url) {
        console.log('🔗 Opening customer portal URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        console.error('❌ No customer portal URL received');
        throw new Error('No customer portal URL received');
      }
    } catch (error) {
      console.error('💥 Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Reset state when user changes
  useEffect(() => {
    if (user?.id !== lastUserIdRef.current) {
      retryCountRef.current = 0;
      hasCheckedRef.current = false;
      isFetchingRef.current = false;
    }
  }, [user?.id]);

  // Single effect to trigger subscription check - runs once per user
  useEffect(() => {
    // Don't check if still loading admin status
    if (adminLoading) return;
    // Don't check if user is admin (handled separately)
    if (isAdmin) return;
    // Don't check if already checked for this user
    if (hasCheckedRef.current && lastUserIdRef.current === user?.id) return;
    
    checkSubscription();
  }, [user?.id, adminLoading, isAdmin, checkSubscription]);

  return {
    ...subscription,
    isAdmin,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
