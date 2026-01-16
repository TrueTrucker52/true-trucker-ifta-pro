import { useState } from 'react';
import { MapPin, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface LocationTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  onCancel: () => void;
}

/**
 * Location Transparency Modal
 * 
 * This modal provides clear disclosure about how location data is used
 * before triggering the system location permission request.
 * 
 * Required for Google Play Data Safety compliance and user transparency.
 */
export const LocationTransparencyModal = ({
  isOpen,
  onClose,
  onPermissionGranted,
  onCancel,
}: LocationTransparencyModalProps) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleProceed = async () => {
    setIsRequesting(true);
    
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web fallback - request via getCurrentPosition
        navigator.geolocation.getCurrentPosition(
          () => {
            localStorage.setItem('location_permission', 'granted');
            localStorage.setItem('location_transparency_shown', 'true');
            onPermissionGranted();
            onClose();
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
              localStorage.setItem('location_permission', 'denied');
              onCancel();
            }
            onClose();
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        // Native platform - use Capacitor
        const status = await Geolocation.requestPermissions();
        
        if (status.location === 'granted' || status.coarseLocation === 'granted') {
          localStorage.setItem('location_permission', 'granted');
          localStorage.setItem('location_transparency_shown', 'true');
          onPermissionGranted();
        } else {
          localStorage.setItem('location_permission', 'denied');
          onCancel();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      onCancel();
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancel = () => {
    localStorage.setItem('location_permission', 'manual');
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 bg-primary/10 rounded-full p-3 w-fit">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">How we use your location</DialogTitle>
          <DialogDescription className="sr-only">
            Location data usage disclosure
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Main disclosure - exact text as requested */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm leading-relaxed text-foreground">
              <strong>True Trucker IFTA Pro</strong> collects location data to enable{' '}
              <strong>automatic trip logging</strong> and{' '}
              <strong>state-line detection</strong> even when the app is closed or not in use.
            </p>
          </div>

          {/* Privacy assurance */}
          <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This data is used <strong className="text-foreground">solely for IFTA mileage reporting</strong> and is{' '}
              <strong className="text-foreground">never shared for advertising</strong>.
            </p>
          </div>

          {/* Additional context */}
          <p className="text-xs text-muted-foreground text-center">
            You can change this setting anytime in your device settings or use manual entry mode instead.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleProceed} 
            className="w-full"
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting Access...' : 'Proceed'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="w-full"
            disabled={isRequesting}
          >
            Cancel
          </Button>
        </DialogFooter>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          disabled={isRequesting}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default LocationTransparencyModal;
