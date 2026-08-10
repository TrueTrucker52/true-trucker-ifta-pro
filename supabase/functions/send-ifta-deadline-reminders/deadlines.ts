// IFTA quarterly deadlines (kept in sync with src/lib/iftaDeadlines.ts)
export interface Deadline {
  quarter: number;
  quarterYear: number;
  /** YYYY-MM-DD */
  dueDate: string;
  dueDateLabel: string;
}

const DUE_DATES: Record<number, { month: number; day: number; yearOffset: number }> = {
  1: { month: 4, day: 30, yearOffset: 0 },
  2: { month: 7, day: 31, yearOffset: 0 },
  3: { month: 10, day: 31, yearOffset: 0 },
  4: { month: 1, day: 31, yearOffset: 1 },
};

const QUARTER_NAMES = ["Quarter One", "Quarter Two", "Quarter Three", "Quarter Four"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const quarterName = (quarter: number) => QUARTER_NAMES[quarter - 1] ?? `Quarter ${quarter}`;

const pad = (n: number) => String(n).padStart(2, "0");

/** Days between two YYYY-MM-DD dates (UTC based, no DST drift). */
export const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);

/** Next IFTA deadline on or after `todayIso` (YYYY-MM-DD). Never in the past. */
export const getNextDeadline = (todayIso: string): Deadline => {
  const year = Number(todayIso.slice(0, 4));

  const candidates: Deadline[] = [];
  for (const quarterYear of [year - 1, year, year + 1]) {
    for (const quarter of [1, 2, 3, 4]) {
      const { month, day, yearOffset } = DUE_DATES[quarter];
      const dueYear = quarterYear + yearOffset;
      candidates.push({
        quarter,
        quarterYear,
        dueDate: `${dueYear}-${pad(month)}-${pad(day)}`,
        dueDateLabel: `${MONTH_NAMES[month - 1]} ${day}, ${dueYear}`,
      });
    }
  }

  candidates.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return candidates.find((c) => c.dueDate >= todayIso) ?? candidates[candidates.length - 1];
};
