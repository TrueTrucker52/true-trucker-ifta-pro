import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  status: string;
  masked_referred_email: string | null;
  signed_up_at: string | null;
  converted_at: string | null;
  reward_applied: boolean;
  created_at: string;
}

interface ReferralReward {
  id: string;
  user_id: string;
  reward_type: string;
  reward_value: number;
  reward_status: string;
  referral_id: string | null;
  stripe_coupon_id: string | null;
  expires_at: string | null;
  created_at: string;
}

interface ReferralStats {
  totalReferrals: number;
  convertedCount: number;
  freeMonthsEarned: number;
  nextMilestone: { target: number; current: number; reward: string };
}

const MILESTONES = [
  { target: 1, reward: '1 FREE month', couponId: '3b1rJ0gc', couponCode: 'REFER1FREE', type: 'free_month', value: 1 },
  { target: 3, reward: '3 FREE months', couponId: '0VoNYl1G', couponCode: 'REFER3FREE', type: 'free_month', value: 3 },
  { target: 5, reward: 'Free plan upgrade for 3 months', couponId: null, couponCode: null, type: 'upgrade', value: 3 },
  { target: 10, reward: '1 FULL YEAR FREE', couponId: null, couponCode: null, type: 'free_year', value: 12 },
];

export const useReferrals = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [refResult, rewardResult] = await Promise.all([
      supabase.rpc('get_my_referrals'),
      supabase.from('referral_rewards').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (refResult.data) setReferrals(refResult.data as unknown as Referral[]);
    if (rewardResult.data) setRewards(rewardResult.data as unknown as ReferralReward[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    }
  }, [profile]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const stats: ReferralStats = (() => {
    const convertedCount = referrals.filter(r => r.status === 'converted' || r.status === 'rewarded').length;
    const freeMonthsEarned = rewards
      .filter(r => r.reward_status === 'applied' && r.reward_type === 'free_month')
      .reduce((sum, r) => sum + r.reward_value, 0);

    const nextMilestone = MILESTONES.find(m => convertedCount < m.target) || MILESTONES[MILESTONES.length - 1];

    return {
      totalReferrals: referrals.length,
      convertedCount,
      freeMonthsEarned,
      nextMilestone: { target: nextMilestone.target, current: convertedCount, reward: nextMilestone.reward },
    };
  })();

  const sendInvite = useCallback(async (email: string) => {
    if (!user || !referralCode) return;

    const { error } = await supabase.from('referrals').insert({
      referrer_id: user.id,
      referral_code: referralCode,
      referred_email: email,
      status: 'pending',
    });

    if (!error) {
      toast({ title: '📧 Invite sent!', description: `Referral invite sent to ${email}` });
      fetchReferrals();
    }
  }, [user, referralCode, toast, fetchReferrals]);

  const getShareText = useCallback(() => {
    if (!referralCode) return '';
    return `Hey! I've been using TrueTrucker for IFTA filing and it's amazing. Way better than doing it manually. Sign up with my code ${referralCode} and we both get a free month! https://true-trucker-ifta-pro.com/ref/${referralCode}`;
  }, [referralCode]);

  const getReferralLink = useCallback(() => {
    if (!referralCode) return '';
    return `https://true-trucker-ifta-pro.lovable.app/ref/${referralCode}`;
  }, [referralCode]);

  const copyCode = useCallback(async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    toast({ title: '📋 Copied!', description: 'Referral code copied to clipboard' });
  }, [referralCode, toast]);

  const copyLink = useCallback(async () => {
    const link = getReferralLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast({ title: '🔗 Copied!', description: 'Referral link copied to clipboard' });
  }, [getReferralLink, toast]);

  const shareNative = useCallback(async () => {
    if (!navigator.share) {
      copyLink();
      return;
    }
    try {
      await navigator.share({
        title: 'Join TrueTrucker IFTA Pro',
        text: getShareText(),
        url: getReferralLink(),
      });
    } catch {
      // User cancelled share
    }
  }, [getShareText, getReferralLink, copyLink]);

  return {
    referrals,
    rewards,
    stats,
    referralCode,
    loading,
    sendInvite,
    getShareText,
    getReferralLink,
    copyCode,
    copyLink,
    shareNative,
    milestones: MILESTONES,
    refresh: fetchReferrals,
  };
};
