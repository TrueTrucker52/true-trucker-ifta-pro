import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TripOption {
  id: string;
  trip_number: string | null;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  start_date: string;
  end_date: string | null;
  total_miles: number | null;
  fuel_gallons: number | null;
  fuel_cost: number | null;
}

export const UNASSIGNED = 'none';

export const tripLabel = (t: TripOption) =>
  `${t.trip_number ? t.trip_number + ' · ' : ''}${t.origin_city}, ${t.origin_state} → ${t.destination_city}, ${t.destination_state} (${t.start_date})`;

export const useTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setTrips([]);
      return;
    }
    setLoading(true);
    supabase
      .from('trips')
      .select('id, trip_number, origin_city, origin_state, destination_city, destination_state, start_date, end_date, total_miles, fuel_gallons, fuel_cost')
      .order('start_date', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (active) {
          setTrips((data as TripOption[]) || []);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  return { trips, loading };
};

interface Props {
  trips: TripOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const TripAssignSelect = ({ trips, value, onChange, label = 'Assign to trip (optional)' }: Props) => (
  <div className="space-y-2">
    <Label htmlFor="trip-assign">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="trip-assign">
        <SelectValue placeholder="No trip — file to fuel log only" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>No trip — file to fuel log only</SelectItem>
        {trips.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {tripLabel(t)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
