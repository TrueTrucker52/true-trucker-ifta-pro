import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type DutyStatus = 'off_duty' | 'sleeper' | 'driving' | 'on_duty' | 'personal_conveyance' | 'yard_move';

export interface EldLogEntry {
  id: string;
  driver_id: string;
  truck_id: string | null;
  fleet_id: string | null;
  log_date: string;
  duty_status: DutyStatus;
  status_start: string;
  status_end: string | null;
  duration_minutes: number;
  location_start: string | null;
  location_end: string | null;
  odometer_start: number | null;
  odometer_end: number | null;
  notes: string | null;
  is_certified: boolean;
  certified_at: string | null;
  edited: boolean;
  edit_reason: string | null;
  original_data: any;
  created_at: string;
}

export interface HOSSummary {
  driveTimeUsedMinutes: number;
  driveTimeRemainingMinutes: number;
  onDutyTimeUsedMinutes: number;
  onDutyTimeRemainingMinutes: number;
  breakRequiredInMinutes: number;
  cycleHoursUsedMinutes: number;
  cycleHoursRemainingMinutes: number;
  lastRestEnd: string | null;
  consecutiveDrivingMinutes: number;
}

export interface HOSViolation {
  type: string;
  detail: string;
  severity: 'warning' | 'minor' | 'major' | 'critical';
}

// FMCSA HOS limits in minutes
const DRIVE_LIMIT = 11 * 60; // 660 min
const ON_DUTY_LIMIT = 14 * 60; // 840 min
const BREAK_REQUIRED_AFTER = 8 * 60; // 480 min
const BREAK_DURATION = 30; // 30 min
const CYCLE_LIMIT_8DAY = 70 * 60; // 4200 min
const RESTART_HOURS = 34 * 60; // 2040 min

export const useHOSEngine = () => {
  const { user } = useAuth();
  const [todayLogs, setTodayLogs] = useState<EldLogEntry[]>([]);
  const [weekLogs, setWeekLogs] = useState<EldLogEntry[]>([]);
  const [currentStatus, setCurrentStatus] = useState<DutyStatus>('off_duty');
  const [currentStatusStart, setCurrentStatusStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeViolations, setActiveViolations] = useState<HOSViolation[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const { data, error } = await supabase
      .from('eld_logs')
      .select('*')
      .eq('driver_id', user.id)
      .gte('log_date', eightDaysAgo.toISOString().split('T')[0])
      .order('status_start', { ascending: true });

    if (!error && data) {
      const logs = data as unknown as EldLogEntry[];
      setTodayLogs(logs.filter(l => l.log_date === today));
      setWeekLogs(logs);

      // Find current active status (no end time)
      const active = logs.find(l => !l.status_end);
      if (active) {
        setCurrentStatus(active.duty_status);
        setCurrentStatusStart(active.status_start);
      }
    }
    setLoading(false);
  }, [user, today]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Calculate HOS summary
  const hosSummary = useMemo((): HOSSummary => {
    const calcMinutes = (logs: EldLogEntry[], status: DutyStatus | DutyStatus[]) => {
      const statuses = Array.isArray(status) ? status : [status];
      return logs
        .filter(l => statuses.includes(l.duty_status as DutyStatus))
        .reduce((sum, l) => {
          if (l.status_end) return sum + l.duration_minutes;
          // Active entry - calculate live duration
          const start = new Date(l.status_start).getTime();
          return sum + Math.floor((Date.now() - start) / 60000);
        }, 0);
    };

    const driveUsed = calcMinutes(todayLogs, 'driving');
    const onDutyUsed = calcMinutes(todayLogs, ['driving', 'on_duty', 'yard_move']);

    // Consecutive driving since last 30+ min break
    let consecutiveDriving = 0;
    const reversedToday = [...todayLogs].reverse();
    for (const log of reversedToday) {
      if (log.duty_status === 'driving') {
        const dur = log.status_end
          ? log.duration_minutes
          : Math.floor((Date.now() - new Date(log.status_start).getTime()) / 60000);
        consecutiveDriving += dur;
      } else if (['off_duty', 'sleeper'].includes(log.duty_status) && log.duration_minutes >= BREAK_DURATION) {
        break;
      }
    }

    // 8-day cycle calculation
    const cycleUsed = calcMinutes(weekLogs, ['driving', 'on_duty', 'yard_move']);

    // Find last qualifying rest period (10+ hours off)
    let lastRestEnd: string | null = null;
    const reversedWeek = [...weekLogs].reverse();
    let offDutyAccum = 0;
    for (const log of reversedWeek) {
      if (['off_duty', 'sleeper'].includes(log.duty_status)) {
        offDutyAccum += log.duration_minutes;
        if (offDutyAccum >= 600) { // 10 hours
          lastRestEnd = log.status_end || new Date().toISOString();
          break;
        }
      } else {
        offDutyAccum = 0;
      }
    }

    return {
      driveTimeUsedMinutes: driveUsed,
      driveTimeRemainingMinutes: Math.max(0, DRIVE_LIMIT - driveUsed),
      onDutyTimeUsedMinutes: onDutyUsed,
      onDutyTimeRemainingMinutes: Math.max(0, ON_DUTY_LIMIT - onDutyUsed),
      breakRequiredInMinutes: Math.max(0, BREAK_REQUIRED_AFTER - consecutiveDriving),
      cycleHoursUsedMinutes: cycleUsed,
      cycleHoursRemainingMinutes: Math.max(0, CYCLE_LIMIT_8DAY - cycleUsed),
      lastRestEnd,
      consecutiveDrivingMinutes: consecutiveDriving,
    };
  }, [todayLogs, weekLogs]);

  // Check for violations
  useEffect(() => {
    const violations: HOSViolation[] = [];
    const s = hosSummary;

    // 11-hour driving limit
    if (s.driveTimeRemainingMinutes <= 0) {
      violations.push({ type: '11_hour_driving', detail: 'DRIVING LIMIT REACHED — You must stop driving now.', severity: 'critical' });
    } else if (s.driveTimeRemainingMinutes <= 30) {
      violations.push({ type: '11_hour_driving', detail: `Only ${s.driveTimeRemainingMinutes} minutes of driving remaining.`, severity: 'major' });
    } else if (s.driveTimeRemainingMinutes <= 60) {
      violations.push({ type: '11_hour_driving', detail: '1 hour of driving remaining.', severity: 'warning' });
    }

    // 14-hour on-duty limit
    if (s.onDutyTimeRemainingMinutes <= 0) {
      violations.push({ type: '14_hour_on_duty', detail: '14 HOUR LIMIT REACHED — You cannot drive until reset.', severity: 'critical' });
    } else if (s.onDutyTimeRemainingMinutes <= 60) {
      violations.push({ type: '14_hour_on_duty', detail: '1 hour remaining on 14-hour clock.', severity: 'warning' });
    }

    // 30-minute break
    if (s.breakRequiredInMinutes <= 0 && currentStatus === 'driving') {
      violations.push({ type: '30_min_break', detail: '30-minute break required NOW. You have driven 8+ hours without a break.', severity: 'major' });
    } else if (s.breakRequiredInMinutes <= 30 && s.breakRequiredInMinutes > 0) {
      violations.push({ type: '30_min_break', detail: `30-minute break required within ${s.breakRequiredInMinutes} minutes.`, severity: 'warning' });
    }

    // 70-hour/8-day cycle
    if (s.cycleHoursRemainingMinutes <= 0) {
      violations.push({ type: '70_hour_cycle', detail: 'WEEKLY LIMIT REACHED — 34-hour restart required.', severity: 'critical' });
    } else if (s.cycleHoursRemainingMinutes <= 300) {
      violations.push({ type: '70_hour_cycle', detail: `${Math.floor(s.cycleHoursRemainingMinutes / 60)}h ${s.cycleHoursRemainingMinutes % 60}m remaining on 70-hour cycle.`, severity: 'warning' });
    }

    setActiveViolations(violations);
  }, [hosSummary, currentStatus]);

  // Change duty status
  const changeDutyStatus = useCallback(async (
    newStatus: DutyStatus,
    location?: string,
    odometer?: number,
    notes?: string
  ) => {
    if (!user) return { success: false };

    const now = new Date().toISOString();

    // Close current active log entry
    const { data: activeLog } = await supabase
      .from('eld_logs')
      .select('*')
      .eq('driver_id', user.id)
      .is('status_end', null)
      .single();

    if (activeLog) {
      const start = new Date(activeLog.status_start).getTime();
      const duration = Math.floor((Date.now() - start) / 60000);
      await supabase
        .from('eld_logs')
        .update({
          status_end: now,
          duration_minutes: duration,
          location_end: location || null,
          odometer_end: odometer || null,
        })
        .eq('id', activeLog.id);
    }

    // Insert new log entry
    const { error } = await supabase
      .from('eld_logs')
      .insert({
        driver_id: user.id,
        log_date: today,
        duty_status: newStatus,
        status_start: now,
        location_start: location || null,
        odometer_start: odometer || null,
        notes: notes || null,
      });

    if (!error) {
      setCurrentStatus(newStatus);
      setCurrentStatusStart(now);
      await fetchLogs();

      // Log critical violations
      const criticalViolations = activeViolations.filter(v => v.severity === 'critical' || v.severity === 'major');
      for (const v of criticalViolations) {
        await supabase.from('hos_violations').insert({
          driver_id: user.id,
          violation_type: v.type,
          violation_detail: v.detail,
          severity: v.severity,
        });
      }

      return { success: true };
    }

    return { success: false };
  }, [user, today, fetchLogs, activeViolations]);

  // Certify daily log
  const certifyLog = useCallback(async (date: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('eld_logs')
      .update({ is_certified: true, certified_at: new Date().toISOString() })
      .eq('driver_id', user.id)
      .eq('log_date', date);

    if (!error) {
      await fetchLogs();
      return true;
    }
    return false;
  }, [user, fetchLogs]);

  // Edit log entry
  const editLogEntry = useCallback(async (logId: string, updates: Partial<EldLogEntry>, reason: string) => {
    if (!user) return false;

    // Get original data first
    const { data: original } = await supabase
      .from('eld_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (!original) return false;

    const { error } = await supabase
      .from('eld_logs')
      .update({
        ...updates,
        edited: true,
        edit_reason: reason,
        original_data: original,
      })
      .eq('id', logId);

    if (!error) {
      await fetchLogs();
      return true;
    }
    return false;
  }, [user, fetchLogs]);

  return {
    currentStatus,
    currentStatusStart,
    todayLogs,
    weekLogs,
    hosSummary,
    activeViolations,
    loading,
    changeDutyStatus,
    certifyLog,
    editLogEntry,
    refreshLogs: fetchLogs,
  };
};

// Utility: format minutes to "Xh Ym"
export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};
