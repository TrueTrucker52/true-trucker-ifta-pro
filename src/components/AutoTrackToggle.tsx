import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import LocationTransparencyModal from './LocationTransparencyModal';

interface AutoTrackToggleProps {
  isTracking: boolean;
  onStartTracking: () => Promise<boolean>;
  onStopTracking: () => void;
  disabled?: boolean;
}

export const AutoTrackToggle = ({
  isTracking,
  onStartTracking,
  onStopTracking,
  disabled = false,
}: AutoTrackToggleProps) => {
  const {
    isAutoTracking: hasLocationPermission,
    showTransparencyModal,
    requestAutoTrack,
    closeTransparencyModal,
    setPermissionGranted,
    setPermissionDenied,
  } = useLocationPermission();

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Check if we have location permission
      if (!hasLocationPermission) {
        // Show transparency modal first
        requestAutoTrack();
        return;
      }

      // Start tracking
      setIsLoading(true);
      const success = await onStartTracking();
      setIsLoading(false);
      
      if (!success) {
        // If tracking failed, show transparency modal
        requestAutoTrack();
      }
    } else {
      onStopTracking();
    }
  };

  const handlePermissionGranted = async () => {
    setPermissionGranted();
    closeTransparencyModal();
    
    // Start tracking after permission granted
    setIsLoading(true);
    await onStartTracking();
    setIsLoading(false);
  };

  const handlePermissionDenied = () => {
    setPermissionDenied();
    closeTransparencyModal();
  };

  return (
    <>
      <Card className={isTracking ? 'border-success bg-success/5' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isTracking ? 'bg-success/20' : 'bg-muted'}`}>
                {isTracking ? (
                  <Navigation className="h-5 w-5 text-success animate-pulse" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="auto-track" className="font-semibold cursor-pointer">
                  Auto-Track Miles
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isTracking
                    ? 'GPS tracking active - miles logged automatically'
                    : 'Enable automatic mileage tracking via GPS'}
                </p>
              </div>
            </div>
            <Switch
              id="auto-track"
              checked={isTracking}
              onCheckedChange={handleToggle}
              disabled={disabled || isLoading}
              className="data-[state=checked]:bg-success"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Transparency Modal */}
      <LocationTransparencyModal
        isOpen={showTransparencyModal}
        onClose={closeTransparencyModal}
        onPermissionGranted={handlePermissionGranted}
        onCancel={handlePermissionDenied}
      />
    </>
  );
};

export default AutoTrackToggle;
