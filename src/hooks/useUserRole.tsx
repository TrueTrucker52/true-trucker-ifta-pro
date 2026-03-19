import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'fleet_owner' | 'driver' | 'moderator' | 'user' | 'reviewer';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRole = async () => {
      if (!user) {
        if (!cancelled) { setRole(null); setLoading(false); }
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_role');

        if (cancelled) return;

        if (error || !data) {
          // Default to 'driver' if no role is assigned
          setRole('driver');
        } else {
          setRole(data as AppRole);
        }
      } catch {
        if (!cancelled) setRole('driver');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRole();
    return () => { cancelled = true; };
  }, [user]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isFleetOwner: role === 'fleet_owner',
    isDriver: role === 'driver' || role === null,
  };
};
