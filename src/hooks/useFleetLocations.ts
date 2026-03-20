import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface TruckLocation {
  id: string;
  driver_id: string;
  truck_id: string;
  fleet_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  state_code: string | null;
  address: string | null;
  is_moving: boolean;
  trip_id: string | null;
  battery_level: number | null;
  signal_strength: string;
  recorded_at: string;
}

export interface EnrichedTruckLocation extends TruckLocation {
  driverName: string;
  driverEmail: string;
  truckNumber: string;
  truckMake: string | null;
  truckModel: string | null;
}

export const useFleetLocations = (fleetId: string | null) => {
  const queryClient = useQueryClient();

  // Get latest location per truck in the fleet
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['fleet-locations', fleetId],
    queryFn: async () => {
      if (!fleetId) return [];
      // Get the most recent location for each truck
      const { data, error } = await supabase
        .from('truck_locations')
        .select('*')
        .eq('fleet_id', fleetId)
        .order('recorded_at', { ascending: false });
      if (error) throw error;

      // Deduplicate: keep only the latest per truck_id
      const latestByTruck = new Map<string, any>();
      for (const loc of data || []) {
        if (!latestByTruck.has(loc.truck_id)) {
          latestByTruck.set(loc.truck_id, loc);
        }
      }
      return Array.from(latestByTruck.values()) as TruckLocation[];
    },
    enabled: !!fleetId,
    refetchInterval: 30000, // Fallback polling every 30s
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!fleetId) return;

    const channel = supabase
      .channel('fleet-locations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'truck_locations',
          filter: `fleet_id=eq.${fleetId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['fleet-locations', fleetId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fleetId, queryClient]);

  return { locations, isLoading };
};

export const useDriverGPSReporter = () => {
  const { user } = useAuth();

  const reportLocation = useCallback(
    async (params: {
      truckId: string;
      fleetId: string;
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      stateCode?: string;
      address?: string;
      isMoving?: boolean;
      tripId?: string;
      batteryLevel?: number;
    }) => {
      if (!user) return;
      const { error } = await supabase.from('truck_locations').insert({
        driver_id: user.id,
        truck_id: params.truckId,
        fleet_id: params.fleetId,
        latitude: params.latitude,
        longitude: params.longitude,
        speed: params.speed ?? 0,
        heading: params.heading ?? 0,
        state_code: params.stateCode ?? null,
        address: params.address ?? null,
        is_moving: params.isMoving ?? false,
        trip_id: params.tripId ?? null,
        battery_level: params.batteryLevel ?? null,
        signal_strength: 'good',
        recorded_at: new Date().toISOString(),
      });
      if (error) console.error('GPS report error:', error);
    },
    [user]
  );

  return { reportLocation };
};
