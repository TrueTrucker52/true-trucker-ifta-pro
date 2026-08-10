import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_WEIGHTS, type MatchSignals, type MatchWeights } from '@/lib/tripMatch';

interface FeedbackRow {
  suggested_trip_id: string | null;
  helpful: boolean;
  day_offset: number | null;
  state_matched: boolean;
  gallons_matched: boolean;
}

/** Clamp so a few corrections nudge — never flip — the scoring. */
const clamp = (n: number) => Math.max(0.6, Math.min(1.4, n));

const weightFor = (rows: FeedbackRow[], present: (r: FeedbackRow) => boolean) => {
  const relevant = rows.filter(present);
  if (relevant.length < 2) return 1;
  const good = relevant.filter((r) => r.helpful).length;
  const ratio = good / relevant.length;
  // 100% helpful -> 1.2, 50% -> 1.0, 0% -> 0.8
  return clamp(0.8 + ratio * 0.4);
};

/**
 * Learns from thumbs-up/thumbs-down on auto-match suggestions: signals that
 * historically led to good matches get weighted up, and trips the user keeps
 * rejecting get weighted down.
 */
export const useMatchFeedback = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<MatchWeights>(DEFAULT_WEIGHTS);
  const [totalFeedback, setTotalFeedback] = useState(0);

  const load = useCallback(async () => {
    if (!user) {
      setWeights(DEFAULT_WEIGHTS);
      setTotalFeedback(0);
      return;
    }
    const { data } = await supabase
      .from('receipt_match_feedback')
      .select('suggested_trip_id, helpful, day_offset, state_matched, gallons_matched')
      .order('created_at', { ascending: false })
      .limit(200);

    const rows = (data as FeedbackRow[]) || [];
    setTotalFeedback(rows.length);
    if (!rows.length) {
      setWeights(DEFAULT_WEIGHTS);
      return;
    }

    const tripBias: Record<string, number> = {};
    rows.forEach((r) => {
      if (!r.suggested_trip_id) return;
      const current = tripBias[r.suggested_trip_id] ?? 1;
      tripBias[r.suggested_trip_id] = clamp(current + (r.helpful ? 0.08 : -0.12));
    });

    setWeights({
      date: weightFor(rows, (r) => r.day_offset !== null),
      state: weightFor(rows, (r) => r.state_matched),
      gallons: weightFor(rows, (r) => r.gallons_matched),
      tripBias,
    });
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const submitFeedback = useCallback(
    async (params: {
      helpful: boolean;
      suggestedTripId: string;
      chosenTripId?: string | null;
      matchScore: number;
      signals: MatchSignals;
    }) => {
      if (!user) return;
      await supabase.from('receipt_match_feedback').insert({
        user_id: user.id,
        suggested_trip_id: params.suggestedTripId,
        chosen_trip_id: params.chosenTripId ?? null,
        helpful: params.helpful,
        match_score: params.matchScore,
        day_offset: params.signals.dayOffset,
        state_matched: params.signals.stateMatched,
        gallons_matched: params.signals.gallonsMatched,
      });
      await load();
    },
    [user, load]
  );

  return { weights, totalFeedback, submitFeedback };
};
