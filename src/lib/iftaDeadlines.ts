/**
 * IFTA quarterly filing deadlines.
 * Q1 (Jan–Mar) → Apr 30 · Q2 (Apr–Jun) → Jul 31
 * Q3 (Jul–Sep) → Oct 31 · Q4 (Oct–Dec) → Jan 31 (next year)
 */

export interface IftaDeadline {
  /** Quarter being filed (1-4) */
  quarter: number;
  /** Year of the quarter being filed */
  quarterYear: number;
  /** Due date (local time, end of day) */
  dueDate: Date;
  /** e.g. "October 31, 2026" */
  dueDateLabel: string;
  /** Whole days from now until the deadline (0 = due today) */
  daysRemaining: number;
  /** True when the deadline is 14 days out or less */
  isUrgent: boolean;
}

const QUARTER_NAMES = ['Quarter One', 'Quarter Two', 'Quarter Three', 'Quarter Four'];

/** Month (0-indexed) and day the given quarter's return is due. */
const DUE_DATES: Record<number, { month: number; day: number; yearOffset: number }> = {
  1: { month: 3, day: 30, yearOffset: 0 }, // April 30
  2: { month: 6, day: 31, yearOffset: 0 }, // July 31
  3: { month: 9, day: 31, yearOffset: 0 }, // October 31
  4: { month: 0, day: 31, yearOffset: 1 }, // January 31 of next year
};

export const quarterName = (quarter: number) => QUARTER_NAMES[quarter - 1] ?? `Quarter ${quarter}`;

const endOfDay = (year: number, month: number, day: number) =>
  new Date(year, month, day, 23, 59, 59, 999);

/**
 * Returns the next IFTA deadline that has not passed yet, relative to `now`.
 * Never returns a date in the past.
 */
export const getNextIftaDeadline = (now: Date = new Date()): IftaDeadline => {
  const year = now.getFullYear();

  // Candidate deadlines for this year plus Q4 of last year (due Jan 31 this year).
  const candidates = [
    { quarter: 4, quarterYear: year - 1 },
    { quarter: 1, quarterYear: year },
    { quarter: 2, quarterYear: year },
    { quarter: 3, quarterYear: year },
    { quarter: 4, quarterYear: year },
    { quarter: 1, quarterYear: year + 1 },
  ].map(({ quarter, quarterYear }) => {
    const { month, day, yearOffset } = DUE_DATES[quarter];
    return { quarter, quarterYear, dueDate: endOfDay(quarterYear + yearOffset, month, day) };
  });

  const next = candidates.find((c) => c.dueDate.getTime() >= now.getTime()) ?? candidates[candidates.length - 1];

  const msPerDay = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDue = new Date(
    next.dueDate.getFullYear(),
    next.dueDate.getMonth(),
    next.dueDate.getDate(),
  ).getTime();
  const daysRemaining = Math.max(0, Math.round((startOfDue - startOfToday) / msPerDay));

  return {
    quarter: next.quarter,
    quarterYear: next.quarterYear,
    dueDate: next.dueDate,
    dueDateLabel: next.dueDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    daysRemaining,
    isUrgent: daysRemaining <= 14,
  };
};
