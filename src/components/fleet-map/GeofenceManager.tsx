import { useState } from 'react';
import { MapPin, Plus, Trash2, Target, Building2, Package, Flag, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Geofence } from '@/hooks/useGeofences';
import { cn } from '@/lib/utils';

interface GeofenceManagerProps {
  geofences: Geofence[];
  isAddingMode: boolean;
  pendingLocation: { lat: number; lng: number } | null;
  onToggleAddMode: () => void;
  onCreateGeofence: (params: {
    name: string;
    zone_type: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    color: string;
    notify_on_enter: boolean;
    notify_on_exit: boolean;
  }) => void;
  onDeleteGeofence: (id: string) => void;
  onFocusGeofence: (gf: Geofence) => void;
}

const ZONE_TYPES = [
  { value: 'customer', label: '📍 Customer', color: '#3b82f6' },
  { value: 'warehouse', label: '🏭 Warehouse', color: '#8b5cf6' },
  { value: 'restricted', label: '⛔ Restricted', color: '#ef4444' },
  { value: 'delivery', label: '🏁 Delivery', color: '#22c55e' },
];

const RADIUS_OPTIONS = [
  { value: 200, label: '200m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
];

const GeofenceManager = ({
  geofences,
  isAddingMode,
  pendingLocation,
  onToggleAddMode,
  onCreateGeofence,
  onDeleteGeofence,
  onFocusGeofence,
}: GeofenceManagerProps) => {
  const [name, setName] = useState('');
  const [zoneType, setZoneType] = useState('customer');
  const [radius, setRadius] = useState(500);
  const [notifyEnter, setNotifyEnter] = useState(true);
  const [notifyExit, setNotifyExit] = useState(true);

  const selectedZone = ZONE_TYPES.find(z => z.value === zoneType)!;

  const handleCreate = () => {
    if (!pendingLocation || !name.trim()) return;
    onCreateGeofence({
      name: name.trim(),
      zone_type: zoneType,
      latitude: pendingLocation.lat,
      longitude: pendingLocation.lng,
      radius_meters: radius,
      color: selectedZone.color,
      notify_on_enter: notifyEnter,
      notify_on_exit: notifyExit,
    });
    setName('');
    setZoneType('customer');
    setRadius(500);
  };

  const zoneIcon = (type: string) => {
    switch (type) {
      case 'customer': return <MapPin className="h-4 w-4" />;
      case 'warehouse': return <Building2 className="h-4 w-4" />;
      case 'restricted': return <Target className="h-4 w-4" />;
      case 'delivery': return <Flag className="h-4 w-4" />;
      default: return <CircleDot className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4 border-b">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Geofence Zones
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{geofences.length} zone{geofences.length !== 1 ? 's' : ''} active</p>
      </div>

      {/* Add zone button or form */}
      <div className="p-3 border-b">
        {!isAddingMode ? (
          <Button onClick={onToggleAddMode} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Zone
          </Button>
        ) : !pendingLocation ? (
          <div className="text-center space-y-2">
            <div className="bg-primary/10 rounded-lg p-3">
              <MapPin className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium">Click on the map to place your zone</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggleAddMode} className="text-xs">
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Zone Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Atlanta Warehouse"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={zoneType} onValueChange={setZoneType}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_TYPES.map(z => (
                    <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Radius</Label>
              <Select value={String(radius)} onValueChange={v => setRadius(Number(v))}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map(r => (
                    <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Alert on Enter</Label>
              <Switch checked={notifyEnter} onCheckedChange={setNotifyEnter} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Alert on Exit</Label>
              <Switch checked={notifyExit} onCheckedChange={setNotifyExit} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleCreate} disabled={!name.trim()}>
                Save Zone
              </Button>
              <Button size="sm" variant="ghost" onClick={onToggleAddMode}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {/* Zone list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {geofences.map(gf => (
            <button
              key={gf.id}
              onClick={() => onFocusGeofence(gf)}
              className="w-full text-left rounded-lg p-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span style={{ color: gf.color }}>{zoneIcon(gf.zone_type)}</span>
                <span className="font-medium text-sm truncate flex-1">{gf.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteGeofence(gf.id); }}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] h-4 px-1">
                  {ZONE_TYPES.find(z => z.value === gf.zone_type)?.label || gf.zone_type}
                </Badge>
                <span>{gf.radius_meters}m radius</span>
              </div>
              <div className="flex gap-2 mt-1">
                {gf.notify_on_enter && <span className="text-[10px] text-green-600">📥 Enter</span>}
                {gf.notify_on_exit && <span className="text-[10px] text-red-600">📤 Exit</span>}
              </div>
            </button>
          ))}
          {geofences.length === 0 && (
            <p className="text-xs text-muted-foreground text-center p-4">No zones yet. Add one to start monitoring.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GeofenceManager;
