import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TripAssignSelect, UNASSIGNED, useTrips, tripLabel } from '@/components/receipts/TripAssignSelect';

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

/** Receipts whose trip was assigned automatically and still await a human look. */
export const AutoAssignedReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trips } = useTrips();
  const [rows, setRows] = useState<AutoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id: string, tripId: string | null) => {
    setBusyId(id);
    const { error } = await supabase
      .from('receipts')
      .update({ trip_id: tripId, trip_auto_assigned: false })
      .eq('id', id);
    setBusyId(null);
    if (error) {
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' });
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Receipt reviewed', description: tripId ? 'Trip assignment confirmed.' : 'Receipt left unassigned.' });
  };

  return (
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
          rows.map((r) => {
            const current = r.trip_id ?? UNASSIGNED;
            const trip = trips.find((t) => t.id === r.trip_id);
            return (
              <div key={r.id} className="rounded-md border border-border p-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
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
                  onChange={(v) => resolve(r.id, v === UNASSIGNED ? null : v)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === r.id}
                    onClick={() => resolve(r.id, r.trip_id)}
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
                    disabled={busyId === r.id}
                    onClick={() => resolve(r.id, null)}
                  >
                    Unassign
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
