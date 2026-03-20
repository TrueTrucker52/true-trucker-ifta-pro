import { Truck, MapPin, Gauge, MessageSquare, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnrichedTruckLocation } from '@/hooks/useFleetLocations';
import { cn } from '@/lib/utils';

interface TruckListSidebarProps {
  trucks: EnrichedTruckLocation[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string) => void;
  onMessageDriver: (driverId: string) => void;
  fleetName: string;
}

const TruckListSidebar = ({ trucks, selectedTruckId, onSelectTruck, onMessageDriver, fleetName }: TruckListSidebarProps) => {
  const activeTrucks = trucks.filter(t => minutesSince(t.recorded_at) < 30);

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          {fleetName || 'Fleet Map'}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {activeTrucks.length} truck{activeTrucks.length !== 1 ? 's' : ''} active · Updated: just now
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {trucks.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">No truck locations yet</p>
          )}
          {trucks.map(truck => {
            const status = getStatus(truck);
            return (
              <button
                key={truck.id}
                onClick={() => onSelectTruck(truck.truck_id)}
                className={cn(
                  'w-full text-left rounded-lg p-3 transition-colors hover:bg-accent/50',
                  selectedTruckId === truck.truck_id && 'bg-accent'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', status.color)} />
                  <span className="font-semibold text-sm">#{truck.truckNumber}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{truck.driverName}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {truck.state_code || '—'}</span>
                  <span className="flex items-center gap-0.5"><Gauge className="h-3 w-3" /> {Math.round(truck.speed)} mph</span>
                </div>
                {status.label === 'Idling' && (
                  <p className="text-xs text-yellow-600 mt-1">Idle {Math.round(minutesSince(truck.recorded_at))} min</p>
                )}
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={e => { e.stopPropagation(); onSelectTruck(truck.truck_id); }}
                  >
                    <Navigation className="h-3 w-3 mr-0.5" /> Track
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2"
                    onClick={e => { e.stopPropagation(); onMessageDriver(truck.driver_id); }}
                  >
                    <MessageSquare className="h-3 w-3 mr-0.5" /> MSG
                  </Button>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

function minutesSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

function getStatus(truck: EnrichedTruckLocation) {
  if (truck.is_moving) return { label: 'Moving', color: 'bg-green-500' };
  if (minutesSince(truck.recorded_at) < 5) return { label: 'Idling', color: 'bg-yellow-500' };
  if (minutesSince(truck.recorded_at) < 30) return { label: 'Stopped', color: 'bg-red-500' };
  return { label: 'Offline', color: 'bg-gray-400' };
}

export default TruckListSidebar;
