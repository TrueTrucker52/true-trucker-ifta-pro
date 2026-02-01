import { useState, useEffect } from 'react';
import { MapPin, Shield, AlertTriangle } from 'lucide-react';
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

const DISCLOSURE_STORAGE_KEY = 'prominent_location_disclosure_accepted';
const DISCLOSURE_DENIED_KEY = 'prominent_location_disclosure_denied';

interface ProminentLocationDisclosureProps {
  /**
   * Called when user accepts the disclosure and location permission is granted
   */
  onAccepted?: () => void;
  /**
   * Called when user denies the disclosure
   */
  onDenied?: () => void;
}

/**
 * Prominent Location Disclosure Modal
 * 
 * Required for Google Play Store compliance (2024+ policy).
 * Must be shown BEFORE requesting Android location permissions.
 * 
 * This modal displays the exact required disclosure text:
 * "TrueTrucker IFTA Pro collects location data to enable automatic trip 
 * mileage tracking and jurisdiction detection even when the app is closed 
 * or not in use."
 */
export const ProminentLocationDisclosure = ({
  onAccepted,
  onDenied,
}: ProminentLocationDisclosureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or denied the disclosure
    const hasAccepted = localStorage.getItem(DISCLOSURE_STORAGE_KEY) === 'true';
    const hasDenied = localStorage.getItem(DISCLOSURE_DENIED_KEY) === 'true';
    
    // Only show modal if user hasn't made a choice yet
    if (!hasAccepted && !hasDenied) {
      // Small delay to ensure dashboard is rendered first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = async () => {
    setIsRequesting(true);
    
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web fallback - request via getCurrentPosition
        navigator.geolocation.getCurrentPosition(
          () => {
            // Permission granted
            localStorage.setItem(DISCLOSURE_STORAGE_KEY, 'true');
            localStorage.setItem('location_permission', 'granted');
            localStorage.setItem('location_transparency_shown', 'true');
            setIsOpen(false);
            onAccepted?.();
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
              // User denied system permission after accepting disclosure
              localStorage.setItem(DISCLOSURE_STORAGE_KEY, 'true'); // They accepted disclosure
              localStorage.setItem('location_permission', 'denied');
            }
            setIsOpen(false);
            onDenied?.();
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        // Native platform - use Capacitor
        const status = await Geolocation.requestPermissions();
        
        localStorage.setItem(DISCLOSURE_STORAGE_KEY, 'true');
        
        if (status.location === 'granted' || status.coarseLocation === 'granted') {
          localStorage.setItem('location_permission', 'granted');
          localStorage.setItem('location_transparency_shown', 'true');
          setIsOpen(false);
          onAccepted?.();
        } else {
          localStorage.setItem('location_permission', 'denied');
          setIsOpen(false);
          onDenied?.();
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      localStorage.setItem(DISCLOSURE_STORAGE_KEY, 'true');
      setIsOpen(false);
      onDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem(DISCLOSURE_DENIED_KEY, 'true');
    localStorage.setItem('location_permission', 'manual');
    setIsOpen(false);
    onDenied?.();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full p-4 w-fit">
            <MapPin className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Background Location Access
          </DialogTitle>
          <DialogDescription className="sr-only">
            Location data collection disclosure for IFTA compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Main disclosure - EXACT required text for Google Play */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed font-medium text-amber-800 dark:text-amber-200">
                TrueTrucker IFTA Pro collects location data to enable automatic trip mileage 
                tracking and jurisdiction detection <strong>even when the app is closed or not in use</strong>.
              </p>
            </div>
          </div>

          {/* Additional context */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Why we need this:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Track miles driven in each state for accurate IFTA reporting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Automatically detect when you cross state lines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Create audit-ready trip records without manual entry</span>
              </li>
            </ul>
          </div>

          {/* Privacy assurance */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your location data is <strong className="text-foreground">never shared for advertising</strong> and 
              is used <strong className="text-foreground">solely for IFTA tax compliance</strong>.
            </p>
          </div>

          {/* Manual alternative */}
          <p className="text-xs text-muted-foreground text-center">
            If you deny, you can still use manual trip entry. You can change this later in Settings.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button 
            onClick={handleAccept} 
            className="w-full h-12 text-base font-semibold"
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting Permission...' : 'Accept'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeny}
            className="w-full h-12 text-base"
            disabled={isRequesting}
          >
            Deny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Hook to check if the disclosure has been shown/accepted
 */
export const useProminentDisclosure = () => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [hasDenied, setHasDenied] = useState(false);

  useEffect(() => {
    setHasAccepted(localStorage.getItem(DISCLOSURE_STORAGE_KEY) === 'true');
    setHasDenied(localStorage.getItem(DISCLOSURE_DENIED_KEY) === 'true');
  }, []);

  const resetDisclosure = () => {
    localStorage.removeItem(DISCLOSURE_STORAGE_KEY);
    localStorage.removeItem(DISCLOSURE_DENIED_KEY);
    setHasAccepted(false);
    setHasDenied(false);
  };

  return {
    hasAccepted,
    hasDenied,
    hasResponded: hasAccepted || hasDenied,
    resetDisclosure,
  };
};

export default ProminentLocationDisclosure;