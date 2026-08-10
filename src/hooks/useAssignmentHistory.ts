import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AssignmentSource = 'auto' | 'manual' | 'review' | 'batch' | 'undo';

export interface AssignmentHistoryRow {
  id: string;
  receipt_id: string;
  trip_id: string | null;
  previous_trip_id: string | null;
  source: AssignmentSource;
  match_score: number | null;
  created_at: string;
}

export interface LogAssignmentInput {
  receiptId: string;
  tripId: string | null;
  previousTripId?: string | null;
  source: AssignmentSource;
  matchScore?: number | null;
}

export const sourceLabel = (s: AssignmentSource) =>
  s === 'auto'
    ? 'Auto-assigned'
    : s === 'manual'
      ? 'Assigned while scanning'
      : s === 'review'
        ? 'Confirmed in review'
        : s === 'batch'
          ? 'Batch decision'
          : 'Undone';

/**
 * Trip-assignment audit trail for receipts. Every auto/manual/review decision is
 * logged so the driver can see what happened and undo an auto-assign.
 */
export const useAssignmentHistory = (limit = 50) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<AssignmentHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setRows([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('receipt_assignment_history')
      .select('id, receipt_id, trip_id, previous_trip_id, source, match_score, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    setRows((data as AssignmentHistoryRow[]) || []);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setRows([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('receipt_assignment_history')
        .select('id, receipt_id, trip_id, previous_trip_id, source, match_score, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (active) setRows((data as AssignmentHistoryRow[]) || []);
    })();
    return () => {
      active = false;
    };
  }, [user, limit]);

  return { rows, loading, refresh };
};

/** Writes one history entry. Failures are non-fatal — the assignment still stands. */
export const logAssignment = async (
  userId: string | undefined,
  input: LogAssignmentInput
): Promise<void> => {
  if (!userId) return;
  try {
    await supabase.from('receipt_assignment_history').insert({
      user_id: userId,
      receipt_id: input.receiptId,
      trip_id: input.tripId,
      previous_trip_id: input.previousTripId ?? null,
      source: input.source,
      match_score: input.matchScore ?? null,
    });
    window.dispatchEvent(new Event('ifta:assignmentHistoryChanged'));
  } catch {
    /* history is best-effort */
  }
};
