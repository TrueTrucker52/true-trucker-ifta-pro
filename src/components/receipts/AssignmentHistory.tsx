import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, RefreshCw, ArrowRight } from 'lucide-react';
import { useAssignmentHistory, sourceLabel } from '@/hooks/useAssignmentHistory';
import { useTrips, tripLabel } from '@/components/receipts/TripAssignSelect';

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

/** Audit trail of every trip assignment made for the driver's receipts. */
export const AssignmentHistory = () => {
  const { rows, refresh } = useAssignmentHistory(50);
  const { trips } = useTrips();

  useEffect(() => {
    const sync = () => refresh();
    window.addEventListener('ifta:assignmentHistoryChanged', sync);
    return () => window.removeEventListener('ifta:assignmentHistoryChanged', sync);
  }, [refresh]);

  const name = (id: string | null) => {
    if (!id) return 'No trip';
    const t = trips.find((x) => x.id === id);
    return t ? tripLabel(t) : 'Trip no longer available';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Assignment history
            </CardTitle>
            <CardDescription>
              Every trip assignment for your receipts — automatic, manual, batch and undone.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refresh()} aria-label="Refresh history">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assignments recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="text-sm border-b border-border pb-2 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={r.source === 'auto' ? 'default' : 'secondary'}>
                    {sourceLabel(r.source)}
                  </Badge>
                  {r.match_score != null && (
                    <span className="text-xs text-muted-foreground">{r.match_score}% match</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{fmt(r.created_at)}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <span>{name(r.previous_trip_id)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="text-foreground">{name(r.trip_id)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
