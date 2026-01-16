import { useState, useEffect, useCallback } from 'react';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export type LocationMode = 'auto' | 'manual' | 'unknown';

export const useLocationPermission = () => {
  const [locationMode, setLocationMode] = useState<LocationMode>('unknown');
  const [hasChecked, setHasChecked] = useState(false);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);

  const checkStoredPermission = useCallback(() => {
    const stored = localStorage.getItem('location_permission');
    if (stored === 'granted') {
      setLocationMode('auto');
      return true;
    } else if (stored === 'denied' || stored === 'manual') {
      setLocationMode('manual');
      return true;
    }
    return false;
  }, []);

  const checkNativePermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'granted') {
            setLocationMode('auto');
            localStorage.setItem('location_permission', 'granted');
            return;
          } else if (result.state === 'denied') {
            setLocationMode('manual');
            localStorage.setItem('location_permission', 'denied');
            return;
          }
        } catch {
          // Fallback - needs onboarding
        }
      }
      setLocationMode('unknown');
      return;
    }

    try {
      const status: PermissionStatus = await Geolocation.checkPermissions();
      
      if (status.location === 'granted' || status.coarseLocation === 'granted') {
        setLocationMode('auto');
        localStorage.setItem('location_permission', 'granted');
      } else if (status.location === 'denied') {
        setLocationMode('manual');
        localStorage.setItem('location_permission', 'denied');
      } else {
        setLocationMode('unknown');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationMode('unknown');
    }
  }, []);

  useEffect(() => {
    const hasStored = checkStoredPermission();
    if (!hasStored) {
      checkNativePermission();
    }
    setHasChecked(true);
  }, [checkStoredPermission, checkNativePermission]);

  const setPermissionGranted = useCallback(() => {
    localStorage.setItem('location_permission', 'granted');
    setLocationMode('auto');
  }, []);

  const setPermissionDenied = useCallback(() => {
    localStorage.setItem('location_permission', 'manual');
    setLocationMode('manual');
  }, []);

  /**
   * Triggers the Location Transparency modal before requesting permission.
   * Call this when user attempts to enable "Auto Track" toggle.
   */
  const requestAutoTrack = useCallback(() => {
    // Check if transparency modal was already shown and permission granted
    const transparencyShown = localStorage.getItem('location_transparency_shown');
    const currentPermission = localStorage.getItem('location_permission');
    
    if (transparencyShown === 'true' && currentPermission === 'granted') {
      // Already granted, no need to show modal again
      return;
    }
    
    // Show the transparency modal
    setShowTransparencyModal(true);
  }, []);

  const closeTransparencyModal = useCallback(() => {
    setShowTransparencyModal(false);
  }, []);

  const needsOnboarding = hasChecked && locationMode === 'unknown';
  const isAutoTracking = locationMode === 'auto';
  const isManualEntry = locationMode === 'manual';

  return {
    locationMode,
    needsOnboarding,
    isAutoTracking,
    isManualEntry,
    hasChecked,
    setPermissionGranted,
    setPermissionDenied,
    recheckPermission: checkNativePermission,
    // New: for transparency modal integration
    showTransparencyModal,
    requestAutoTrack,
    closeTransparencyModal,
  };
};
