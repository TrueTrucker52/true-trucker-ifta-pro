import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, ClipboardCheck, Undo2, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TripAssignSelect, UNASSIGNED, useTrips, tripLabel } from '@/components/receipts/TripAssignSelect';
import { logAssignment } from '@/hooks/useAssignmentHistory';

interface AutoRow {
  id: string;
  receipt_date: string;
  vendor: string | null;
  location: string | null;
  state_code: string | null;
  gallons: number | null;
  total_amount: number | null;
  trip_id: string | null;
  trip_match_score: number | null;
}

type Decision = 'confirm' | 'unassign';

interface UndoState {
  rows: AutoRow[];
  description: string;
}

/** Receipts whose trip was assigned automatically and still await a human look. */
export const AutoAssignedReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trips } = useTrips();
  const [rows, setRows] = useState<AutoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts')
      .select('id, receipt_date, vendor, location, state_code, gallons, total_amount, trip_id, trip_match_score')
      .eq('trip_auto_assigned', true)
      .order('receipt_date', { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: 'Could not load auto-matched receipts', variant: 'destructive' });
    }
    setRows((data as AutoRow[]) || []);
    setSelected({});
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedIds = useMemo(
    () => rows.filter((r) => selected[r.id]).map((r) => r.id),
    [rows, selected]
  );
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  /** Applies a decision to a set of rows and records history + an undo point. */
  const applyDecision = async (
    targets: AutoRow[],
    decision: Decision,
    source: 'review' | 'batch',
    description: string
  ) => {
    if (!targets.length) return;
    const ids = targets.map((r) => r.id);
    const updates = targets.map((r) =>
      supabase
        .from('receipts')
        .update({
          trip_id: decision === 'confirm' ? r.trip_id : null,
          trip_auto_assigned: false,
        })
        .eq('id', r.id)
    );
    const results = await Promise.all(updates);
    if (results.some((res) => res.error)) {
      toast({ title: 'Some receipts could not be updated', description: 'Please try again.', variant: 'destructive' });
      await load();
      return;
    }
    await Promise.all(
      targets.map((r) =>
        logAssignment(user?.id, {
          receiptId: r.id,
          tripId: decision === 'confirm' ? r.trip_id : null,
          previousTripId: r.trip_id,
          source,
          matchScore: r.trip_match_score,
        })
      )
    );
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected({});
    setUndoState({ rows: targets, description });
    toast({ title: description, description: 'You can undo this from the banner above.' });
  };

  const changeTrip = async (row: AutoRow, tripId: string | null) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from('receipts')
      .update({ trip_id: tripId, trip_auto_assigned: false })
      .eq('id', row.id);
    setBusyId(null);
    if (error) {
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' });
      return;
    }
    await logAssignment(user?.id, {
      receiptId: row.id,
      tripId,
      previousTripId: row.trip_id,
      source: 'review',
      matchScore: row.trip_match_score,
    });
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setUndoState({ rows: [row], description: tripId ? 'Trip changed' : 'Receipt left unassigned' });
    toast({ title: 'Receipt reviewed' });
  };

  /** Puts the receipts back into the auto-matched queue with their original trips. */
  const undo = async () => {
    if (!undoState) return;
    setBulkBusy(true);
    const results = await Promise.all(
      undoState.rows.map((r) =>
        supabase
          .from('receipts')
          .update({ trip_id: r.trip_id, trip_auto_assigned: true })
          .eq('id', r.id)
      )
    );
    setBulkBusy(false);
    if (results.some((res) => res.error)) {
      toast({ title: 'Undo failed', description: 'Please try again.', variant: 'destructive' });
      return;
    }
    await Promise.all(
      undoState.rows.map((r) =>
        logAssignment(user?.id, {
          receiptId: r.id,
          tripId: r.trip_id,
          source: 'undo',
          matchScore: r.trip_match_score,
        })
      )
    );
    setUndoState(null);
    toast({ title: 'Undone', description: 'Receipts are back in the review list.' });
    await load();
  };

  const runBulk = async (decision: Decision, targets: AutoRow[], label: string) => {
    setBulkBusy(true);
    await applyDecision(targets, decision, 'batch', label);
    setBulkBusy(false);
  };

  return (
    <div className="space-y-4">
      {undoState && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
          <Undo2 className="h-4 w-4 text-primary" />
          <span>
            {undoState.description} · {undoState.rows.length} receipt
            {undoState.rows.length === 1 ? '' : 's'}
          </span>
          <Button size="sm" variant="outline" className="ml-auto" disabled={bulkBusy} onClick={undo}>
            {bulkBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Undo2 className="h-4 w-4 mr-2" />}
            Undo
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setUndoState(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Review auto-matched receipts
          </CardTitle>
          <CardDescription>
            Receipts assigned automatically by the confidence threshold. Confirm or change the trip — reviewed
            receipts drop off this list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Nothing waiting — every auto-matched receipt has been reviewed.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) =>
                      setSelected(v === true ? Object.fromEntries(rows.map((r) => [r.id, true])) : {})
                    }
                    aria-label="Select all receipts"
                  />
                  Select all ({rows.length})
                </label>
                <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <Button
                    size="sm"
                    disabled={bulkBusy || selectedIds.length === 0}
                    onClick={() =>
                      runBulk(
                        'confirm',
                        rows.filter((r) => selected[r.id]),
                        `Confirmed ${selectedIds.length} auto-matched receipt${selectedIds.length === 1 ? '' : 's'}`
                      )
                    }
                  >
                    {bulkBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Confirm selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={bulkBusy || selectedIds.length === 0}
                    onClick={() =>
                      runBulk(
                        'unassign',
                        rows.filter((r) => selected[r.id]),
                        `Unassigned ${selectedIds.length} receipt${selectedIds.length === 1 ? '' : 's'}`
                      )
                    }
                  >
                    Unassign selected
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={bulkBusy}
                    onClick={() => runBulk('confirm', rows, `Confirmed all ${rows.length} auto-matched receipts`)}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Confirm all
                  </Button>
                </div>
              </div>

              {rows.map((r) => {
                const current = r.trip_id ?? UNASSIGNED;
                const trip = trips.find((t) => t.id === r.trip_id);
                return (
                  <div key={r.id} className="rounded-md border border-border p-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Checkbox
                        checked={!!selected[r.id]}
                        onCheckedChange={(v) => setSelected((p) => ({ ...p, [r.id]: v === true }))}
                        aria-label={`Select receipt from ${r.receipt_date}`}
                      />
                      <span className="font-medium">{r.receipt_date}</span>
                      <span className="text-muted-foreground">
                        {r.vendor || 'Unknown vendor'}
                        {r.state_code ? ` · ${r.state_code}` : ''}
                        {r.gallons ? ` · ${r.gallons} gal` : ''}
                        {r.total_amount ? ` · $${Number(r.total_amount).toFixed(2)}` : ''}
                      </span>
                      {r.trip_match_score != null && (
                        <Badge variant="secondary">{r.trip_match_score}% match</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assigned to: {trip ? tripLabel(trip) : 'trip no longer available'}
                    </p>
                    <TripAssignSelect
                      trips={trips}
                      value={current}
                      label="Trip"
                      onChange={(v) => changeTrip(r, v === UNASSIGNED ? null : v)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === r.id || bulkBusy}
                        onClick={() => applyDecision([r], 'confirm', 'review', 'Trip assignment confirmed')}
                      >
                        {busyId === r.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Looks right
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id || bulkBusy}
                        onClick={() => applyDecision([r], 'unassign', 'review', 'Receipt left unassigned')}
                      >
                        Unassign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={bulkBusy}
                        onClick={() =>
                          runBulk('confirm', rows, `Confirmed all ${rows.length} auto-matched receipts`)
                        }
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Apply "Looks right" to all
                      </Button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
