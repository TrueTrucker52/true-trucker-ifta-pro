import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface TrialTrackingData {
  daysRemaining: number;
  trialStart: string | null;
  trialEnd: string | null;
  featuresUsed: Record<string, number>;
  loginCount: number;
  converted: boolean;
  nudgeCount: number;
  isExpired: boolean;
  isTrialUser: boolean;
  urgencyLevel: 'green' | 'yellow' | 'orange' | 'red' | 'expired';
}

interface TrialOffer {
  id: string;
  offer_type: string;
  discount_percent: number;
  offer_code: string | null;
  offer_expires_at: string | null;
  was_shown: boolean;
  was_accepted: boolean;
}

export const useTrialConversion = () => {
  const { user } = useAuth();
  const { trial_active, trial_days_remaining, subscription_status, subscribed } = useSubscription();
  const [tracking, setTracking] = useState<TrialTrackingData>({
    daysRemaining: 7,
    trialStart: null,
    trialEnd: null,
    featuresUsed: {},
    loginCount: 0,
    converted: false,
    nudgeCount: 0,
    isExpired: false,
    isTrialUser: false,
    urgencyLevel: 'green',
  });
  const [activeOffer, setActiveOffer] = useState<TrialOffer | null>(null);
  const [loading, setLoading] = useState(true);

  const getUrgencyLevel = (days: number, expired: boolean): TrialTrackingData['urgencyLevel'] => {
    if (expired) return 'expired';
    if (days <= 1) return 'red';
    if (days <= 2) return 'orange';
    if (days <= 4) return 'yellow';
    return 'green';
  };

  // Initialize or fetch trial tracking
  const fetchTracking = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trial_tracking')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      const isExpired = new Date(data.trial_end) < new Date();
      const daysRemaining = Math.max(0, Math.ceil((new Date(data.trial_end).getTime() - Date.now()) / 86400000));
      setTracking({
        daysRemaining,
        trialStart: data.trial_start,
        trialEnd: data.trial_end,
        featuresUsed: (data.features_used as Record<string, number>) || {},
        loginCount: data.login_count || 0,
        converted: data.converted || false,
        nudgeCount: data.nudge_count || 0,
        isExpired,
        isTrialUser: !data.converted && !subscribed,
        urgencyLevel: getUrgencyLevel(daysRemaining, isExpired),
      });
    } else if (!data && trial_active) {
      // Create initial tracking record
      await supabase.from('trial_tracking').insert({
        user_id: user.id,
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setTracking(prev => ({ ...prev, isTrialUser: true, daysRemaining: trial_days_remaining }));
    }

    // Fetch active offer
    const { data: offerData } = await supabase
      .from('trial_offers')
      .select('*')
      .eq('user_id', user.id)
      .eq('was_accepted', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (offerData) {
      setActiveOffer(offerData as unknown as TrialOffer);
    }

    setLoading(false);
  }, [user, trial_active, trial_days_remaining, subscribed]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Track feature usage
  const trackFeatureUsage = useCallback(async (feature: string) => {
    if (!user || subscribed) return;

    const { data } = await supabase
      .from('trial_tracking')
      .select('features_used')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      const features = (data.features_used as Record<string, number>) || {};
      features[feature] = (features[feature] || 0) + 1;

      await supabase
        .from('trial_tracking')
        .update({ features_used: features, last_active: new Date().toISOString() })
        .eq('user_id', user.id);

      setTracking(prev => ({ ...prev, featuresUsed: features }));
    }
  }, [user, subscribed]);

  // Increment login count
  const trackLogin = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('trial_tracking')
      .update({
        login_count: tracking.loginCount + 1,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  }, [user, tracking.loginCount]);

  // Create a special offer
  const createOffer = useCallback(async (
    offerType: string,
    discountPercent: number,
    offerCode: string,
    expiresInHours: number
  ) => {
    if (!user) return;

    const { data } = await supabase
      .from('trial_offers')
      .insert({
        user_id: user.id,
        offer_type: offerType,
        discount_percent: discountPercent,
        offer_code: offerCode,
        offer_expires_at: new Date(Date.now() + expiresInHours * 3600000).toISOString(),
      })
      .select()
      .single();

    if (data) setActiveOffer(data as unknown as TrialOffer);
  }, [user]);

  // Accept an offer
  const acceptOffer = useCallback(async (offerId: string) => {
    await supabase
      .from('trial_offers')
      .update({ was_accepted: true })
      .eq('id', offerId);
    setActiveOffer(null);
  }, []);

  // Mark as shown
  const markOfferShown = useCallback(async (offerId: string) => {
    await supabase
      .from('trial_offers')
      .update({ was_shown: true })
      .eq('id', offerId);
  }, []);

  // Get personalized plan recommendation
  const getRecommendedPlan = useCallback(() => {
    const features = tracking.featuresUsed;
    const truckCount = (features['truck_added'] || 0);

    if (truckCount >= 6) return { plan: 'fleet_pro', name: 'Fleet Pro', price: 129 };
    if (truckCount >= 2 || features['fleet_dashboard'] > 0) return { plan: 'small_fleet', name: 'Small Fleet', price: 79 };
    return { plan: 'solo', name: 'Solo', price: 39 };
  }, [tracking.featuresUsed]);

  // Get usage-based nudge message
  const getUsageNudge = useCallback((): { message: string; feature: string } | null => {
    const f = tracking.featuresUsed;
    if ((f['bol_scan'] || 0) >= 3) return { message: `You've scanned ${f['bol_scan']} BOLs this trial! Keep scanning unlimited BOLs with any paid plan.`, feature: 'BOL Scanner' };
    if ((f['mileage_logged'] || 0) >= 500) return { message: `You've tracked ${f['mileage_logged']}+ miles! Keep tracking unlimited miles.`, feature: 'Mileage Tracker' };
    if ((f['truck_added'] || 0) >= 2) return { message: `You have ${f['truck_added']} trucks! Upgrade to Small Fleet for up to 5 trucks.`, feature: 'Fleet Management' };
    if ((f['voice_command'] || 0) >= 5) return { message: `You've used Hey Trucker ${f['voice_command']} times! Voice commands are in all paid plans.`, feature: 'Voice Commands' };
    if ((f['eld_status_change'] || 0) >= 3) return { message: `You've used ELD compliance ${f['eld_status_change']} times! Keep this feature in any paid plan.`, feature: 'ELD Compliance' };
    return null;
  }, [tracking.featuresUsed]);

  return {
    tracking,
    activeOffer,
    loading,
    trackFeatureUsage,
    trackLogin,
    createOffer,
    acceptOffer,
    markOfferShown,
    getRecommendedPlan,
    getUsageNudge,
    refreshTracking: fetchTracking,
  };
};
