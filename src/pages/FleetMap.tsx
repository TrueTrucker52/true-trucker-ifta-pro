import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFleetLocations, EnrichedTruckLocation } from '@/hooks/useFleetLocations';
import FleetMapView from '@/components/fleet-map/FleetMapView';
import TruckListSidebar from '@/components/fleet-map/TruckListSidebar';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Truck } from 'lucide-react';

const FleetMap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  // Get fleet
  const { data: fleet } = useQuery({
    queryKey: ['fleet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleets').select('*').eq('owner_id', user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get fleet members
  const { data: members = [] } = useQuery({
    queryKey: ['fleet-members', fleet?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet_members').select('*').eq('fleet_id', fleet!.id).eq('status', 'active');
      if (error) throw error;
      return data;
    },
    enabled: !!fleet?.id,
  });

  const activeDriverIds = useMemo(() => members.map(m => m.driver_id), [members]);

  // Get driver profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['fleet-driver-profiles-map', activeDriverIds],
    queryFn: async () => {
      if (activeDriverIds.length === 0) return [];
      const { data, error } = await supabase.from('profiles').select('user_id, email, company_name').in('user_id', activeDriverIds);
      if (error) throw error;
      return data;
    },
    enabled: activeDriverIds.length > 0,
  });

  // Get fleet trucks
  const { data: trucks = [] } = useQuery({
    queryKey: ['fleet-trucks-map', activeDriverIds],
    queryFn: async () => {
      if (activeDriverIds.length === 0) return [];
      const { data, error } = await supabase.from('trucks').select('*').in('user_id', activeDriverIds).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: activeDriverIds.length > 0,
  });

  // Get live locations
  const { locations, isLoading } = useFleetLocations(fleet?.id ?? null);

  // Enrich locations with driver/truck info
  const enrichedLocations: EnrichedTruckLocation[] = useMemo(() => {
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    const truckMap = new Map(trucks.map(t => [t.id, t]));

    return locations.map(loc => {
      const profile = profileMap.get(loc.driver_id);
      const truck = truckMap.get(loc.truck_id);
      return {
        ...loc,
        driverName: profile?.company_name || profile?.email?.split('@')[0] || 'Unknown',
        driverEmail: profile?.email || '',
        truckNumber: truck?.unit_number || '???',
        truckMake: truck?.make ?? null,
        truckModel: truck?.model ?? null,
      };
    });
  }, [locations, profiles, trucks]);

  const handleMessageDriver = (driverId: string) => {
    navigate('/messages');
  };

  const sidebar = (
    <TruckListSidebar
      trucks={enrichedLocations}
      selectedTruckId={selectedTruckId}
      onSelectTruck={setSelectedTruckId}
      onMessageDriver={handleMessageDriver}
      fleetName={fleet?.company_name || 'Fleet Map'}
    />
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fleet-dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">🚛 Live Fleet Map</h1>
        <span className="ml-auto text-xs text-muted-foreground">
          {enrichedLocations.length} truck{enrichedLocations.length !== 1 ? 's' : ''} active
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {!isMobile && <div className="w-72 flex-shrink-0">{sidebar}</div>}

        {/* Map */}
        <FleetMapView
          trucks={enrichedLocations}
          selectedTruckId={selectedTruckId}
          onSelectTruck={setSelectedTruckId}
        />

        {/* Mobile bottom sheet trigger */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="absolute bottom-20 left-4 z-20 shadow-lg"
                size="sm"
              >
                <Truck className="h-4 w-4 mr-1" />
                Trucks ({enrichedLocations.length})
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FleetMap;
