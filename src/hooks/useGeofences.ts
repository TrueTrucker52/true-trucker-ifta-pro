import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Geofence {
  id: string;
  fleet_id: string;
  created_by: string;
  name: string;
  zone_type: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  color: string;
  notify_on_enter: boolean;
  notify_on_exit: boolean;
  is_active: boolean;
  created_at: string;
}

export interface GeofenceEvent {
  id: string;
  geofence_id: string;
  fleet_id: string;
  driver_id: string;
  truck_id: string;
  event_type: 'enter' | 'exit';
  recorded_at: string;
}

export const useGeofences = (fleetId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: geofences = [], isLoading } = useQuery({
    queryKey: ['geofences', fleetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('fleet_id', fleetId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Geofence[];
    },
    enabled: !!fleetId,
  });

  const { data: recentEvents = [] } = useQuery({
    queryKey: ['geofence-events', fleetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofence_events')
        .select('*')
        .eq('fleet_id', fleetId!)
        .order('recorded_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as GeofenceEvent[];
    },
    enabled: !!fleetId,
  });

  const createGeofence = useMutation({
    mutationFn: async (params: {
      name: string;
      zone_type: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
      color?: string;
      notify_on_enter?: boolean;
      notify_on_exit?: boolean;
    }) => {
      if (!fleetId || !user) throw new Error('No fleet');
      const { error } = await supabase.from('geofences').insert({
        fleet_id: fleetId,
        created_by: user.id,
        name: params.name,
        zone_type: params.zone_type,
        latitude: params.latitude,
        longitude: params.longitude,
        radius_meters: params.radius_meters,
        color: params.color ?? '#f97316',
        notify_on_enter: params.notify_on_enter ?? true,
        notify_on_exit: params.notify_on_exit ?? true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences', fleetId] });
      toast({ title: 'Geofence created', description: 'Zone saved successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create geofence.', variant: 'destructive' });
    },
  });

  const deleteGeofence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('geofences').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences', fleetId] });
      toast({ title: 'Geofence removed' });
    },
  });

  // Check if a point is inside any geofence (returns matched geofence or null)
  const checkGeofences = useCallback(
    (lat: number, lng: number) => {
      return geofences.filter(gf => {
        const dist = haversineMeters(lat, lng, gf.latitude, gf.longitude);
        return dist <= gf.radius_meters;
      });
    },
    [geofences]
  );

  return { geofences, recentEvents, isLoading, createGeofence, deleteGeofence, checkGeofences };
};

/** Haversine distance in meters */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
