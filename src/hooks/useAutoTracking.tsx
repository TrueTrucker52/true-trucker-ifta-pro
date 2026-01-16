import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Approximate state boundaries (simplified bounding boxes for demo)
// In production, you'd use a proper geofencing library or API
const STATE_BOUNDARIES: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  'AL': { minLat: 30.22, maxLat: 35.01, minLng: -88.47, maxLng: -84.89 },
  'AZ': { minLat: 31.33, maxLat: 37.00, minLng: -114.81, maxLng: -109.04 },
  'AR': { minLat: 33.00, maxLat: 36.50, minLng: -94.62, maxLng: -89.64 },
  'CA': { minLat: 32.53, maxLat: 42.01, minLng: -124.48, maxLng: -114.13 },
  'CO': { minLat: 36.99, maxLat: 41.00, minLng: -109.05, maxLng: -102.04 },
  'CT': { minLat: 40.95, maxLat: 42.05, minLng: -73.73, maxLng: -71.79 },
  'DE': { minLat: 38.45, maxLat: 39.84, minLng: -75.79, maxLng: -75.05 },
  'FL': { minLat: 24.40, maxLat: 31.00, minLng: -87.63, maxLng: -80.03 },
  'GA': { minLat: 30.36, maxLat: 35.00, minLng: -85.61, maxLng: -80.84 },
  'ID': { minLat: 42.00, maxLat: 49.00, minLng: -117.24, maxLng: -111.04 },
  'IL': { minLat: 36.97, maxLat: 42.51, minLng: -91.51, maxLng: -87.02 },
  'IN': { minLat: 37.77, maxLat: 41.76, minLng: -88.10, maxLng: -84.78 },
  'IA': { minLat: 40.38, maxLat: 43.50, minLng: -96.64, maxLng: -90.14 },
  'KS': { minLat: 36.99, maxLat: 40.00, minLng: -102.05, maxLng: -94.59 },
  'KY': { minLat: 36.50, maxLat: 39.15, minLng: -89.57, maxLng: -81.96 },
  'LA': { minLat: 28.93, maxLat: 33.02, minLng: -94.04, maxLng: -88.82 },
  'ME': { minLat: 43.06, maxLat: 47.46, minLng: -71.08, maxLng: -66.95 },
  'MD': { minLat: 37.91, maxLat: 39.72, minLng: -79.49, maxLng: -75.05 },
  'MA': { minLat: 41.24, maxLat: 42.89, minLng: -73.51, maxLng: -69.93 },
  'MI': { minLat: 41.70, maxLat: 48.31, minLng: -90.42, maxLng: -82.12 },
  'MN': { minLat: 43.50, maxLat: 49.38, minLng: -97.24, maxLng: -89.49 },
  'MS': { minLat: 30.17, maxLat: 35.00, minLng: -91.66, maxLng: -88.10 },
  'MO': { minLat: 35.99, maxLat: 40.61, minLng: -95.77, maxLng: -89.10 },
  'MT': { minLat: 44.36, maxLat: 49.00, minLng: -116.05, maxLng: -104.04 },
  'NE': { minLat: 40.00, maxLat: 43.00, minLng: -104.05, maxLng: -95.31 },
  'NV': { minLat: 35.00, maxLat: 42.00, minLng: -120.01, maxLng: -114.04 },
  'NH': { minLat: 42.70, maxLat: 45.31, minLng: -72.56, maxLng: -70.70 },
  'NJ': { minLat: 38.93, maxLat: 41.36, minLng: -75.57, maxLng: -73.89 },
  'NM': { minLat: 31.33, maxLat: 37.00, minLng: -109.05, maxLng: -103.00 },
  'NY': { minLat: 40.50, maxLat: 45.02, minLng: -79.76, maxLng: -71.86 },
  'NC': { minLat: 33.84, maxLat: 36.59, minLng: -84.32, maxLng: -75.46 },
  'ND': { minLat: 45.93, maxLat: 49.00, minLng: -104.05, maxLng: -96.55 },
  'OH': { minLat: 38.40, maxLat: 42.33, minLng: -84.82, maxLng: -80.52 },
  'OK': { minLat: 33.62, maxLat: 37.00, minLng: -103.00, maxLng: -94.43 },
  'OR': { minLat: 41.99, maxLat: 46.29, minLng: -124.57, maxLng: -116.46 },
  'PA': { minLat: 39.72, maxLat: 42.27, minLng: -80.52, maxLng: -74.69 },
  'RI': { minLat: 41.15, maxLat: 42.02, minLng: -71.86, maxLng: -71.12 },
  'SC': { minLat: 32.03, maxLat: 35.22, minLng: -83.35, maxLng: -78.54 },
  'SD': { minLat: 42.48, maxLat: 45.95, minLng: -104.06, maxLng: -96.44 },
  'TN': { minLat: 34.98, maxLat: 36.68, minLng: -90.31, maxLng: -81.65 },
  'TX': { minLat: 25.84, maxLat: 36.50, minLng: -106.65, maxLng: -93.51 },
  'UT': { minLat: 37.00, maxLat: 42.00, minLng: -114.05, maxLng: -109.04 },
  'VT': { minLat: 42.73, maxLat: 45.02, minLng: -73.44, maxLng: -71.47 },
  'VA': { minLat: 36.54, maxLat: 39.47, minLng: -83.68, maxLng: -75.24 },
  'WA': { minLat: 45.54, maxLat: 49.00, minLng: -124.85, maxLng: -116.92 },
  'WV': { minLat: 37.20, maxLat: 40.64, minLng: -82.64, maxLng: -77.72 },
  'WI': { minLat: 42.49, maxLat: 47.08, minLng: -92.89, maxLng: -86.25 },
  'WY': { minLat: 40.99, maxLat: 45.01, minLng: -111.06, maxLng: -104.05 },
};

const MILES_PER_DEGREE_LAT = 69; // Approximate
const MILES_THRESHOLD = 5; // Log every 5 miles

interface TrackingState {
  isTracking: boolean;
  currentState: string | null;
  totalMiles: number;
  lastPosition: { lat: number; lng: number } | null;
  startTime: Date | null;
  statesCrossed: string[];
}

export const useAutoTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isTracking: false,
    currentState: null,
    totalMiles: 0,
    lastPosition: null,
    startTime: null,
    statesCrossed: [],
  });
  
  const watchIdRef = useRef<string | null>(null);
  const accumulatedMilesRef = useRef(0);
  const lastLoggedMilesRef = useRef(0);

  // Determine state from coordinates using bounding boxes
  const getStateFromCoords = useCallback((lat: number, lng: number): string | null => {
    for (const [stateCode, bounds] of Object.entries(STATE_BOUNDARIES)) {
      if (
        lat >= bounds.minLat &&
        lat <= bounds.maxLat &&
        lng >= bounds.minLng &&
        lng <= bounds.maxLng
      ) {
        return stateCode;
      }
    }
    return null;
  }, []);

  // Calculate distance between two points in miles
  const calculateDistance = useCallback((
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Log mileage to database
  const logMileage = useCallback(async (
    miles: number,
    stateCode: string,
    position: { lat: number; lng: number }
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.from('trip_logs').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        miles: miles,
        start_location: `Auto-tracked: ${stateCode}`,
        end_location: `Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`,
        purpose: 'Auto-tracked mileage',
        notes: `Automatically logged via GPS tracking in ${stateCode}`,
      });

      if (error) {
        console.error('Error logging mileage:', error);
      } else {
        console.log(`Logged ${miles.toFixed(2)} miles in ${stateCode}`);
      }
    } catch (error) {
      console.error('Failed to log mileage:', error);
    }
  }, [user?.id]);

  // Handle position update
  const handlePositionUpdate = useCallback((position: Position) => {
    const { latitude: lat, longitude: lng } = position.coords;
    const newState = getStateFromCoords(lat, lng);

    setTrackingState(prev => {
      let newTotalMiles = prev.totalMiles;
      let statesCrossed = [...prev.statesCrossed];
      
      // Calculate distance from last position
      if (prev.lastPosition) {
        const distance = calculateDistance(
          prev.lastPosition.lat,
          prev.lastPosition.lng,
          lat,
          lng
        );
        newTotalMiles += distance;
        accumulatedMilesRef.current += distance;
      }

      // Check for state line crossing
      if (newState && prev.currentState && newState !== prev.currentState) {
        if (!statesCrossed.includes(newState)) {
          statesCrossed.push(newState);
        }
        
        // Log accumulated miles for the previous state
        if (accumulatedMilesRef.current > 0) {
          logMileage(
            accumulatedMilesRef.current,
            prev.currentState,
            { lat, lng }
          );
          accumulatedMilesRef.current = 0;
          lastLoggedMilesRef.current = newTotalMiles;
        }

        toast({
          title: `Entered ${newState}`,
          description: `State line crossed. Miles logged for ${prev.currentState}.`,
        });
      }

      // Log every 5 miles within the same state
      if (
        newState &&
        accumulatedMilesRef.current >= MILES_THRESHOLD
      ) {
        logMileage(accumulatedMilesRef.current, newState, { lat, lng });
        accumulatedMilesRef.current = 0;
        lastLoggedMilesRef.current = newTotalMiles;
      }

      return {
        ...prev,
        currentState: newState || prev.currentState,
        totalMiles: newTotalMiles,
        lastPosition: { lat, lng },
        statesCrossed,
      };
    });
  }, [getStateFromCoords, calculateDistance, logMileage, toast]);

  // Start tracking
  const startTracking = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to use auto-tracking.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check permission
      const permission = localStorage.getItem('location_permission');
      if (permission !== 'granted') {
        toast({
          title: 'Location permission required',
          description: 'Please enable location access to use auto-tracking.',
          variant: 'destructive',
        });
        return false;
      }

      // Get initial position
      let initialPosition: Position;
      
      if (Capacitor.isNativePlatform()) {
        initialPosition = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });
      } else {
        // Web fallback
        initialPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                altitudeAccuracy: pos.coords.altitudeAccuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              },
              timestamp: pos.timestamp,
            }),
            reject,
            { enableHighAccuracy: true }
          );
        });
      }

      const initialState = getStateFromCoords(
        initialPosition.coords.latitude,
        initialPosition.coords.longitude
      );

      setTrackingState({
        isTracking: true,
        currentState: initialState,
        totalMiles: 0,
        lastPosition: {
          lat: initialPosition.coords.latitude,
          lng: initialPosition.coords.longitude,
        },
        startTime: new Date(),
        statesCrossed: initialState ? [initialState] : [],
      });

      accumulatedMilesRef.current = 0;
      lastLoggedMilesRef.current = 0;

      // Start watching position
      if (Capacitor.isNativePlatform()) {
        const watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (position, err) => {
            if (position) {
              handlePositionUpdate(position);
            }
            if (err) {
              console.error('Watch position error:', err);
            }
          }
        );
        watchIdRef.current = watchId;
      } else {
        // Web fallback with simulated updates
        const webWatchId = navigator.geolocation.watchPosition(
          (pos) => {
            handlePositionUpdate({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                altitudeAccuracy: pos.coords.altitudeAccuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              },
              timestamp: pos.timestamp,
            });
          },
          (err) => console.error('Web geolocation error:', err),
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
        watchIdRef.current = String(webWatchId);
      }

      // Store tracking state
      localStorage.setItem('auto_tracking_active', 'true');

      toast({
        title: 'Auto-tracking started',
        description: initialState 
          ? `Now tracking in ${initialState}. Miles will be logged automatically.`
          : 'GPS tracking active. Miles will be logged automatically.',
      });

      return true;
    } catch (error) {
      console.error('Failed to start tracking:', error);
      toast({
        title: 'Tracking failed',
        description: 'Could not start GPS tracking. Please check your location settings.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, getStateFromCoords, handlePositionUpdate, toast]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current) {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      } else {
        navigator.geolocation.clearWatch(Number(watchIdRef.current));
      }
      watchIdRef.current = null;
    }

    // Log any remaining miles
    if (accumulatedMilesRef.current > 0 && trackingState.currentState && trackingState.lastPosition) {
      await logMileage(
        accumulatedMilesRef.current,
        trackingState.currentState,
        trackingState.lastPosition
      );
    }

    const summary = {
      totalMiles: trackingState.totalMiles,
      statesCrossed: trackingState.statesCrossed,
      duration: trackingState.startTime 
        ? Math.round((Date.now() - trackingState.startTime.getTime()) / 60000)
        : 0,
    };

    setTrackingState({
      isTracking: false,
      currentState: null,
      totalMiles: 0,
      lastPosition: null,
      startTime: null,
      statesCrossed: [],
    });

    accumulatedMilesRef.current = 0;
    lastLoggedMilesRef.current = 0;
    localStorage.removeItem('auto_tracking_active');

    toast({
      title: 'Tracking stopped',
      description: `Logged ${summary.totalMiles.toFixed(1)} miles across ${summary.statesCrossed.length} state(s) in ${summary.duration} minutes.`,
    });

    return summary;
  }, [trackingState, logMileage, toast]);

  // Restore tracking state on mount
  useEffect(() => {
    const wasTracking = localStorage.getItem('auto_tracking_active') === 'true';
    if (wasTracking && user?.id) {
      // Optionally restart tracking, or show a prompt
      console.log('Previous tracking session detected');
    }

    return () => {
      // Cleanup on unmount
      if (watchIdRef.current) {
        if (Capacitor.isNativePlatform()) {
          Geolocation.clearWatch({ id: watchIdRef.current });
        } else {
          navigator.geolocation.clearWatch(Number(watchIdRef.current));
        }
      }
    };
  }, [user?.id]);

  return {
    ...trackingState,
    startTracking,
    stopTracking,
  };
};
