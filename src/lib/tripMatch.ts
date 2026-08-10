import type { TripOption } from '@/components/receipts/TripAssignSelect';

export interface ReceiptMatchInput {
  /** yyyy-mm-dd */
  date?: string;
  /** two-letter state code */
  stateCode?: string;
  /** gallons purchased */
  gallons?: string | number;
}

export interface TripMatch {
  trip: TripOption;
  /** 0-100 confidence */
  score: number;
  reasons: string[];
}

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
 */
export const scoreTripMatch = (receipt: ReceiptMatchInput, trip: TripOption): TripMatch => {
  const reasons: string[] = [];
  let score = 0;

  // --- Date (max 55) ---
  if (receipt.date) {
    const end = trip.end_date || trip.start_date;
    const fromStart = dayDiff(receipt.date, trip.start_date);
    const fromEnd = dayDiff(receipt.date, end);
    if (fromStart !== null && fromEnd !== null) {
      if (fromStart >= 0 && fromEnd <= 0) {
        score += 55;
        reasons.push('Fuel date falls inside the trip dates');
      } else {
        const off = fromStart < 0 ? Math.abs(fromStart) : fromEnd;
        if (off <= 1) {
          score += 40;
          reasons.push('Fuel date is within a day of the trip');
        } else if (off <= 3) {
          score += 22;
          reasons.push(`Fuel date is ${off} days from the trip`);
        }
      }
    }
  }

  // --- State (max 30) ---
  const st = receipt.stateCode?.trim().toUpperCase();
  if (st) {
    if (st === trip.origin_state?.toUpperCase() && st === trip.destination_state?.toUpperCase()) {
      score += 30;
      reasons.push(`Purchased in ${st}, the trip's only state`);
    } else if (st === trip.origin_state?.toUpperCase()) {
      score += 25;
      reasons.push(`Purchased in ${st}, the trip's origin state`);
    } else if (st === trip.destination_state?.toUpperCase()) {
      score += 25;
      reasons.push(`Purchased in ${st}, the trip's destination state`);
    }
  }

  // --- Gallons (max 15) ---
  const gallons = Number(receipt.gallons);
  if (Number.isFinite(gallons) && gallons > 0) {
    const tripMiles = Number(trip.total_miles) || 0;
    if (tripMiles > 0) {
      // Plausible if the fill-up is no more than the trip could burn at ~5 mpg
      const maxPlausible = tripMiles / 5;
      if (gallons <= maxPlausible) {
        score += 15;
        reasons.push(`${gallons} gal fits this trip's mileage`);
      } else if (gallons <= maxPlausible * 1.5) {
        score += 7;
        reasons.push(`${gallons} gal is slightly high for this trip`);
      }
    } else {
      score += 7;
      reasons.push(`${gallons} gal recorded`);
    }
  }

  return { trip, score: Math.min(100, score), reasons };
};

/** Minimum score before we preselect a trip for the user. */
export const AUTO_MATCH_THRESHOLD = 55;

/** Returns the best-scoring trip, or null when nothing is convincing enough. */
export const findBestTripMatch = (
  receipt: ReceiptMatchInput,
  trips: TripOption[]
): TripMatch | null => {
  if (!trips.length) return null;
  const scored = trips
    .map((t) => scoreTripMatch(receipt, t))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < AUTO_MATCH_THRESHOLD) return null;
  return best;
};
