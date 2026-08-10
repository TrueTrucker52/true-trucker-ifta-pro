import { useCallback, useEffect, useState } from 'react';

export interface AutoAcceptSettings {
  /** Automatically assign the suggested trip when the match is confident enough */
  enabled: boolean;
  /** Minimum match score (0-100) required to auto-accept */
  threshold: number;
}

const STORAGE_KEY = 'ifta:autoAcceptTripMatch';

export const DEFAULT_AUTO_ACCEPT: AutoAcceptSettings = { enabled: false, threshold: 85 };

const read = (): AutoAcceptSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AUTO_ACCEPT;
    const parsed = JSON.parse(raw) as Partial<AutoAcceptSettings>;
    const threshold = Number(parsed.threshold);
    return {
      enabled: parsed.enabled === true,
      threshold: Number.isFinite(threshold) ? Math.min(100, Math.max(55, threshold)) : DEFAULT_AUTO_ACCEPT.threshold,
    };
  } catch {
    return DEFAULT_AUTO_ACCEPT;
  }
};

/**
 * Auto-accept preference for trip auto-matching. Stored locally so it applies
 * per device (the cab tablet can auto-accept while the office desktop reviews).
 * Other mounted components stay in sync through a window event.
 */
export const useAutoAcceptMatch = () => {
  const [settings, setSettings] = useState<AutoAcceptSettings>(read);

  useEffect(() => {
    const sync = () => setSettings(read());
    window.addEventListener('ifta:autoAcceptChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ifta:autoAcceptChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const update = useCallback((patch: Partial<AutoAcceptSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep in-memory only */
      }
      window.dispatchEvent(new Event('ifta:autoAcceptChanged'));
      return next;
    });
  }, []);

  return { settings, update };
};
