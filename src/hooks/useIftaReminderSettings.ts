import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/** Lead times (days before the deadline) a reminder email can be sent at. */
export const IFTA_REMINDER_LEAD_DAYS = [30, 14, 7, 1] as const;
export type IftaReminderLeadDay = (typeof IFTA_REMINDER_LEAD_DAYS)[number];

export interface IftaReminderSettings {
  email_enabled: boolean;
  lead_days: number[];
}

const DEFAULT_SETTINGS: IftaReminderSettings = {
  email_enabled: true,
  lead_days: [...IFTA_REMINDER_LEAD_DAYS],
};

export const useIftaReminderSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['ifta-reminder-settings', user?.id];

  const query = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async (): Promise<IftaReminderSettings & { exists: boolean }> => {
      const { data, error } = await supabase
        .from('ifta_reminder_settings')
        .select('email_enabled, lead_days')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { ...DEFAULT_SETTINGS, exists: false };

      return {
        email_enabled: data.email_enabled,
        lead_days: (data.lead_days ?? []).slice().sort((a, b) => b - a),
        exists: true,
      };
    },
  });

  const save = useMutation({
    mutationFn: async (next: IftaReminderSettings) => {
      if (!user?.id) throw new Error('Not signed in');

      const { error } = await supabase
        .from('ifta_reminder_settings')
        .upsert(
          {
            user_id: user.id,
            email_enabled: next.email_enabled,
            lead_days: next.lead_days.slice().sort((a, b) => b - a),
          },
          { onConflict: 'user_id' },
        );

      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, { ...next, exists: true });
    },
    onError: () => {
      toast.error("Couldn't save your reminder settings. Please try again.");
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Create the default row the first time a signed-in user opens the settings,
  // so reminders work without them touching anything.
  useEffect(() => {
    if (query.data && !query.data.exists && !save.isPending) {
      save.mutate(DEFAULT_SETTINGS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data?.exists]);

  const settings: IftaReminderSettings = query.data
    ? { email_enabled: query.data.email_enabled, lead_days: query.data.lead_days }
    : DEFAULT_SETTINGS;

  const setEnabled = (email_enabled: boolean) => {
    const lead_days = settings.lead_days.length ? settings.lead_days : [...IFTA_REMINDER_LEAD_DAYS];
    save.mutate({ email_enabled, lead_days });
  };

  const toggleLeadDay = (day: IftaReminderLeadDay) => {
    const has = settings.lead_days.includes(day);
    const lead_days = has
      ? settings.lead_days.filter((d) => d !== day)
      : [...settings.lead_days, day];

    if (lead_days.length === 0) {
      toast.error('Keep at least one reminder so you never miss the deadline.');
      return;
    }

    save.mutate({ email_enabled: settings.email_enabled, lead_days });
  };

  return {
    settings,
    isLoading: query.isLoading,
    isSaving: save.isPending,
    setEnabled,
    toggleLeadDay,
  };
};
