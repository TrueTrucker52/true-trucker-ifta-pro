import { Truck, MessageSquare, MapPin, Battery, Navigation, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrichedTruckLocation } from '@/hooks/useFleetLocations';

interface TruckMarkerPopupProps {
  truck: EnrichedTruckLocation;
  onTrack?: () => void;
  onMessage?: () => void;
}

const TruckMarkerPopup = ({ truck, onTrack, onMessage }: TruckMarkerPopupProps) => {
  const getStatusColor = () => {
    if (truck.is_moving) return 'bg-green-500';
    if (truck.speed === 0 && minutesSince(truck.recorded_at) < 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusLabel = () => {
    if (truck.is_moving) return 'Moving';
    if (minutesSince(truck.recorded_at) < 5) return 'Idling';
    return 'Stopped';
  };

  return (
    <div className="p-3 min-w-[220px] space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary" />
        <span className="font-bold">Truck #{truck.truckNumber}</span>
        <Badge variant="outline" className="ml-auto text-xs">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor()}`} />
          {getStatusLabel()}
        </Badge>
      </div>

      <div className="text-muted-foreground space-y-1">
        <p className="flex items-center gap-1"><span className="font-medium text-foreground">Driver:</span> {truck.driverName}</p>
        <p className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {Math.round(truck.speed)} mph</p>
        <p className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {headingToDir(truck.heading)}</p>
        {truck.address && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {truck.address}</p>}
        {truck.state_code && <p>State: {truck.state_code}</p>}
        {truck.battery_level != null && (
          <p className="flex items-center gap-1"><Battery className="h-3 w-3" /> {truck.battery_level}%</p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="default" className="flex-1 text-xs h-7" onClick={onTrack}>
          <MapPin className="h-3 w-3 mr-1" /> Track
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={onMessage}>
          <MessageSquare className="h-3 w-3 mr-1" /> Message
        </Button>
      </div>
    </div>
  );
};

function minutesSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

function headingToDir(deg: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8] || 'N';
}

export default TruckMarkerPopup;
