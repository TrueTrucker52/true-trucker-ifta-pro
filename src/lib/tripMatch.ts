import type { TripOption } from '@/components/receipts/TripAssignSelect';

export interface ReceiptMatchInput {
  /** yyyy-mm-dd */
  date?: string;
  /** two-letter state code */
  stateCode?: string;
  /** gallons purchased */
  gallons?: string | number;
}

/** Signals that produced a match — logged with thumbs feedback so weights can adapt. */
export interface MatchSignals {
  /** Days between the receipt date and the nearest trip date (0 = inside window) */
  dayOffset: number | null;
  stateMatched: boolean;
  gallonsMatched: boolean;
}

/** One scoring signal, surfaced in the UI so the match can be trusted at a glance. */
export interface MatchSignalDetail {
  key: 'date' | 'state' | 'gallons';
  label: string;
  /** Points this signal contributed (after learned weighting) */
  points: number;
  /** Maximum points this signal can contribute */
  max: number;
  /** strong = full credit, partial = some credit, none = no credit / missing data */
  strength: 'strong' | 'partial' | 'none';
  /** Short human explanation, e.g. "Inside trip dates" */
  detail: string;
}

export type MatchConfidence = 'high' | 'medium' | 'low';

export interface TripMatch {
  trip: TripOption;
  /** 0-100 confidence */
  score: number;
  confidence: MatchConfidence;
  reasons: string[];
  signals: MatchSignals;
  /** Per-signal breakdown, strongest first */
  signalDetails: MatchSignalDetail[];
}

export const confidenceLabel = (c: MatchConfidence) =>
  c === 'high' ? 'High confidence' : c === 'medium' ? 'Medium confidence' : 'Low confidence';

const toConfidence = (score: number): MatchConfidence =>
  score >= 80 ? 'high' : score >= 55 ? 'medium' : 'low';

/**
 * Learned multipliers per signal (1 = neutral). Derived from the user's
 * thumbs-up/thumbs-down history on past suggestions.
 */
export interface MatchWeights {
  date: number;
  state: number;
  gallons: number;
  /** Per-trip multiplier, e.g. trips the user repeatedly rejected */
  tripBias?: Record<string, number>;
}

export const DEFAULT_WEIGHTS: MatchWeights = { date: 1, state: 1, gallons: 1 };

const dayDiff = (a: string, b: string) => {
  const t1 = new Date(a + 'T00:00:00').getTime();
  const t2 = new Date(b + 'T00:00:00').getTime();
  if (Number.isNaN(t1) || Number.isNaN(t2)) return null;
  return Math.round((t1 - t2) / 86400000);
};

/**
 * Scores a receipt against a trip using fuel date, purchase state and gallons.
 * Date is weighted heaviest (a receipt inside the trip window is the strongest
 * signal), then state overlap, then whether gallons look plausible for the trip.
 * Learned weights nudge each signal based on past user corrections.
 */
export const scoreTripMatch = (
  receipt: ReceiptMatchInput,
  trip: TripOption,
  weights: MatchWeights = DEFAULT_WEIGHTS
): TripMatch => {
  const reasons: string[] = [];
  let dateScore = 0;
  let stateScore = 0;
  let gallonsScore = 0;
  const signals: MatchSignals = { dayOffset: null, stateMatched: false, gallonsMatched: false };

  // --- Date (max 55) ---
  if (receipt.date) {
    const end = trip.end_date || trip.start_date;
    const fromStart = dayDiff(receipt.date, trip.start_date);
    const fromEnd = dayDiff(receipt.date, end);
    if (fromStart !== null && fromEnd !== null) {
      if (fromStart >= 0 && fromEnd <= 0) {
        dateScore = 55;
        signals.dayOffset = 0;
        reasons.push('Fuel date falls inside the trip dates');
      } else {
        const off = fromStart < 0 ? Math.abs(fromStart) : fromEnd;
        signals.dayOffset = off;
        if (off <= 1) {
          dateScore = 40;
          reasons.push('Fuel date is within a day of the trip');
        } else if (off <= 3) {
          dateScore = 22;
          reasons.push(`Fuel date is ${off} days from the trip`);
        }
      }
    }
  }

  // --- State (max 30) ---
  const st = receipt.stateCode?.trim().toUpperCase();
  if (st) {
    if (st === trip.origin_state?.toUpperCase() && st === trip.destination_state?.toUpperCase()) {
      stateScore = 30;
      reasons.push(`Purchased in ${st}, the trip's only state`);
    } else if (st === trip.origin_state?.toUpperCase()) {
      stateScore = 25;
      reasons.push(`Purchased in ${st}, the trip's origin state`);
    } else if (st === trip.destination_state?.toUpperCase()) {
      stateScore = 25;
      reasons.push(`Purchased in ${st}, the trip's destination state`);
    }
    signals.stateMatched = stateScore > 0;
  }

  // --- Gallons (max 15) ---
  const gallons = Number(receipt.gallons);
  if (Number.isFinite(gallons) && gallons > 0) {
    const tripMiles = Number(trip.total_miles) || 0;
    if (tripMiles > 0) {
      // Plausible if the fill-up is no more than the trip could burn at ~5 mpg
      const maxPlausible = tripMiles / 5;
      if (gallons <= maxPlausible) {
        gallonsScore = 15;
        reasons.push(`${gallons} gal fits this trip's mileage`);
      } else if (gallons <= maxPlausible * 1.5) {
        gallonsScore = 7;
        reasons.push(`${gallons} gal is slightly high for this trip`);
      }
    } else {
      gallonsScore = 7;
      reasons.push(`${gallons} gal recorded`);
    }
    signals.gallonsMatched = gallonsScore >= 15;
  }

  const weighted =
    dateScore * weights.date + stateScore * weights.state + gallonsScore * weights.gallons;
  const bias = weights.tripBias?.[trip.id] ?? 1;
  const score = Math.round(Math.max(0, Math.min(100, weighted * bias)));

  const dateDetail = !receipt.date
    ? 'No date read from the receipt'
    : signals.dayOffset === 0
      ? 'Inside the trip dates'
      : signals.dayOffset === null
        ? 'Trip dates unavailable'
        : `${signals.dayOffset} day${signals.dayOffset === 1 ? '' : 's'} outside the trip`;

  const stateDetail = !st
    ? 'No state read from the receipt'
    : signals.stateMatched
      ? `${st} matches this trip`
      : `${st} is not on this trip`;

  const gallonsDetail = !Number.isFinite(gallons) || gallons <= 0
    ? 'No gallons read from the receipt'
    : gallonsScore >= 15
      ? `${gallons} gal fits the trip mileage`
      : gallonsScore > 0
        ? `${gallons} gal is high for this trip`
        : `${gallons} gal looks off for this trip`;

  const mk = (
    key: MatchSignalDetail['key'],
    label: string,
    raw: number,
    max: number,
    mult: number,
    detail: string
  ): MatchSignalDetail => ({
    key,
    label,
    points: Math.round(raw * mult * bias),
    max,
    strength: raw >= max ? 'strong' : raw > 0 ? 'partial' : 'none',
    detail,
  });

  const signalDetails: MatchSignalDetail[] = [
    mk('date', 'Date', dateScore, 55, weights.date, dateDetail),
    mk('state', 'State', stateScore, 30, weights.state, stateDetail),
    mk('gallons', 'Gallons', gallonsScore, 15, weights.gallons, gallonsDetail),
  ].sort((a, b) => b.points - a.points);

  return {
    trip,
    score,
    confidence: toConfidence(score),
    reasons,
    signals,
    signalDetails,
  };
};

/** Minimum score before we preselect a trip for the user. */
export const AUTO_MATCH_THRESHOLD = 55;

/** Returns the best-scoring trip, or null when nothing is convincing enough. */
export const findBestTripMatch = (
  receipt: ReceiptMatchInput,
  trips: TripOption[],
  weights: MatchWeights = DEFAULT_WEIGHTS
): TripMatch | null => {
  const best = rankTripMatches(receipt, trips, weights)[0];
  if (!best || best.score < AUTO_MATCH_THRESHOLD) return null;
  return best;
};

/**
 * All trips scored and ordered best-first. Unlike findBestTripMatch this ignores
 * the threshold so the UI can offer runner-up trips as alternatives.
 */
export const rankTripMatches = (
  receipt: ReceiptMatchInput,
  trips: TripOption[],
  weights: MatchWeights = DEFAULT_WEIGHTS,
  limit?: number
): TripMatch[] => {
  if (!trips.length) return [];
  const scored = trips
    .map((t) => scoreTripMatch(receipt, t, weights))
    .sort((a, b) => b.score - a.score);
  return limit ? scored.slice(0, limit) : scored;
};
