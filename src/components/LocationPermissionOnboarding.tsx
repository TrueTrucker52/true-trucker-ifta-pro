import { useState, useEffect } from 'react';
import { MapPin, Navigation, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

interface LocationPermissionOnboardingProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  onSkip?: () => void;
}

const LocationPermissionOnboarding = ({
  onPermissionGranted,
  onPermissionDenied,
  onSkip,
}: LocationPermissionOnboardingProps) => {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('checking');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    // For web, check if we're in a mobile context
    if (!Capacitor.isNativePlatform()) {
      // On web, use navigator.permissions if available
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') {
            setPermissionState('granted');
            onPermissionGranted();
            return;
          } else if (result.state === 'denied') {
            setPermissionState('denied');
            return;
          }
        } catch {
          // Fallback to prompt state
        }
      }
      setPermissionState('prompt');
      return;
    }

    try {
      const status: PermissionStatus = await Geolocation.checkPermissions();
      
      if (status.location === 'granted' || status.coarseLocation === 'granted') {
        setPermissionState('granted');
        onPermissionGranted();
      } else if (status.location === 'denied') {
        setPermissionState('denied');
      } else {
        setPermissionState('prompt');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setPermissionState('prompt');
    }
  };

  const requestPermission = async () => {
    setRequesting(true);
    
    try {
      if (!Capacitor.isNativePlatform()) {
        // Web fallback - request via getCurrentPosition
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermissionState('granted');
            localStorage.setItem('location_permission', 'granted');
            onPermissionGranted();
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
              setPermissionState('denied');
              localStorage.setItem('location_permission', 'denied');
            }
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        // Native platform - use Capacitor
        const status = await Geolocation.requestPermissions();
        
        if (status.location === 'granted' || status.coarseLocation === 'granted') {
          setPermissionState('granted');
          localStorage.setItem('location_permission', 'granted');
          onPermissionGranted();
        } else {
          setPermissionState('denied');
          localStorage.setItem('location_permission', 'denied');
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionState('denied');
    } finally {
      setRequesting(false);
    }
  };

  const handleManualEntry = () => {
    localStorage.setItem('location_permission', 'manual');
    onPermissionDenied();
  };

  if (permissionState === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="animate-pulse">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Checking location access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionState === 'granted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Location Access Enabled</h2>
            <p className="text-muted-foreground">
              Automatic mileage tracking is ready to go!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Location Access Denied</CardTitle>
            <CardDescription>
              No worries! You can still use True Trucker IFTA Pro with manual mileage entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Manual Entry Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                You'll enter your trip start and end locations manually. 
                We'll calculate the distance for you based on the addresses provided.
              </p>
            </div>
            
            <Button onClick={handleManualEntry} className="w-full">
              Continue with Manual Entry
            </Button>
            
            <div className="text-center">
              <button
                onClick={checkPermission}
                className="text-sm text-primary hover:underline"
              >
                I've enabled location in settings - check again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permission state is 'prompt'
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-4">
            <Navigation className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Enable Location Tracking</CardTitle>
          <CardDescription className="text-base">
            For automatic IFTA mileage logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main disclosure */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm leading-relaxed">
              <strong>True Trucker IFTA Pro</strong> collects location data to enable{' '}
              <strong>automatic mileage tracking</strong> and{' '}
              <strong>state-line detection</strong> even when the app is closed or not in use.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">What you get:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Automatic Trip Recording</p>
                  <p className="text-xs text-muted-foreground">
                    Miles logged automatically as you drive
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">State Border Detection</p>
                  <p className="text-xs text-muted-foreground">
                    Accurate IFTA jurisdiction tracking
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Your Data is Private</p>
                  <p className="text-xs text-muted-foreground">
                    Location data is encrypted and never sold
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={requestPermission} 
              className="w-full h-12 text-base"
              disabled={requesting}
            >
              {requesting ? (
                'Requesting Access...'
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  Enable Location Access
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleManualEntry}
              className="w-full text-muted-foreground"
            >
              Continue without location (manual entry)
            </Button>
          </div>

          {/* Privacy link */}
          <p className="text-xs text-center text-muted-foreground">
            By enabling, you agree to our{' '}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPermissionOnboarding;
