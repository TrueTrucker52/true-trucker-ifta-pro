// IFTA Tax Calculation Engine
// Handles state-by-state fuel tax calculations based on miles driven and fuel purchased

export interface StateInfo {
  code: string;
  name: string;
  taxRate: number; // per gallon in dollars
  fuelTaxRate: number; // backup rate
}

export interface IFTAData {
  state: string;
  miles: number;
  fuelPurchased: number;
  taxOwed: number;
  fuelUsed: number;
  netTax: number;
  kyuTax?: number; // Kentucky Weight Distance Tax
}

export interface IFTACalculationResult {
  quarter: number;
  year: number;
  totalMiles: number;
  totalFuelPurchased: number;
  totalTaxOwed: number;
  totalFuelUsed: number;
  averageMPG: number;
  stateBreakdown: IFTAData[];
  netAmount: number; // Amount owed or refund
  totalKyuTax?: number; // Kentucky Weight Distance Tax total
  hasKentuckyMiles?: boolean; // Flag to show KY warning
}

// Current IFTA tax rates by state (2024 rates - should be updated annually)
export const STATE_TAX_RATES: Record<string, StateInfo> = {
  'AL': { code: 'AL', name: 'Alabama', taxRate: 0.2400, fuelTaxRate: 0.2400 },
  'AK': { code: 'AK', name: 'Alaska', taxRate: 0.0820, fuelTaxRate: 0.0820 },
  'AZ': { code: 'AZ', name: 'Arizona', taxRate: 0.1800, fuelTaxRate: 0.1800 },
  'AR': { code: 'AR', name: 'Arkansas', taxRate: 0.2450, fuelTaxRate: 0.2450 },
  'CA': { code: 'CA', name: 'California', taxRate: 0.4427, fuelTaxRate: 0.4427 },
  'CO': { code: 'CO', name: 'Colorado', taxRate: 0.2200, fuelTaxRate: 0.2200 },
  'CT': { code: 'CT', name: 'Connecticut', taxRate: 0.4000, fuelTaxRate: 0.4000 },
  'DE': { code: 'DE', name: 'Delaware', taxRate: 0.2200, fuelTaxRate: 0.2200 },
  'FL': { code: 'FL', name: 'Florida', taxRate: 0.2460, fuelTaxRate: 0.2460 },
  'GA': { code: 'GA', name: 'Georgia', taxRate: 0.2900, fuelTaxRate: 0.2900 },
  'ID': { code: 'ID', name: 'Idaho', taxRate: 0.3200, fuelTaxRate: 0.3200 },
  'IL': { code: 'IL', name: 'Illinois', taxRate: 0.4550, fuelTaxRate: 0.4550 },
  'IN': { code: 'IN', name: 'Indiana', taxRate: 0.3000, fuelTaxRate: 0.3000 },
  'IA': { code: 'IA', name: 'Iowa', taxRate: 0.3040, fuelTaxRate: 0.3040 },
  'KS': { code: 'KS', name: 'Kansas', taxRate: 0.2600, fuelTaxRate: 0.2600 },
  'KY': { code: 'KY', name: 'Kentucky', taxRate: 0.2490, fuelTaxRate: 0.2490 },
  'LA': { code: 'LA', name: 'Louisiana', taxRate: 0.2000, fuelTaxRate: 0.2000 },
  'ME': { code: 'ME', name: 'Maine', taxRate: 0.3140, fuelTaxRate: 0.3140 },
  'MD': { code: 'MD', name: 'Maryland', taxRate: 0.3550, fuelTaxRate: 0.3550 },
  'MA': { code: 'MA', name: 'Massachusetts', taxRate: 0.2400, fuelTaxRate: 0.2400 },
  'MI': { code: 'MI', name: 'Michigan', taxRate: 0.2830, fuelTaxRate: 0.2830 },
  'MN': { code: 'MN', name: 'Minnesota', taxRate: 0.2865, fuelTaxRate: 0.2865 },
  'MS': { code: 'MS', name: 'Mississippi', taxRate: 0.1840, fuelTaxRate: 0.1840 },
  'MO': { code: 'MO', name: 'Missouri', taxRate: 0.1700, fuelTaxRate: 0.1700 },
  'MT': { code: 'MT', name: 'Montana', taxRate: 0.2775, fuelTaxRate: 0.2775 },
  'NE': { code: 'NE', name: 'Nebraska', taxRate: 0.2690, fuelTaxRate: 0.2690 },
  'NV': { code: 'NV', name: 'Nevada', taxRate: 0.2700, fuelTaxRate: 0.2700 },
  'NH': { code: 'NH', name: 'New Hampshire', taxRate: 0.2320, fuelTaxRate: 0.2320 },
  'NJ': { code: 'NJ', name: 'New Jersey', taxRate: 0.4180, fuelTaxRate: 0.4180 },
  'NM': { code: 'NM', name: 'New Mexico', taxRate: 0.1888, fuelTaxRate: 0.1888 },
  'NY': { code: 'NY', name: 'New York', taxRate: 0.4345, fuelTaxRate: 0.4345 },
  'NC': { code: 'NC', name: 'North Carolina', taxRate: 0.3650, fuelTaxRate: 0.3650 },
  'ND': { code: 'ND', name: 'North Dakota', taxRate: 0.2300, fuelTaxRate: 0.2300 },
  'OH': { code: 'OH', name: 'Ohio', taxRate: 0.3470, fuelTaxRate: 0.3470 },
  'OK': { code: 'OK', name: 'Oklahoma', taxRate: 0.2000, fuelTaxRate: 0.2000 },
  'OR': { code: 'OR', name: 'Oregon', taxRate: 0.3650, fuelTaxRate: 0.3650 },
  'PA': { code: 'PA', name: 'Pennsylvania', taxRate: 0.5870, fuelTaxRate: 0.5870 },
  'RI': { code: 'RI', name: 'Rhode Island', taxRate: 0.3500, fuelTaxRate: 0.3500 },
  'SC': { code: 'SC', name: 'South Carolina', taxRate: 0.2200, fuelTaxRate: 0.2200 },
  'SD': { code: 'SD', name: 'South Dakota', taxRate: 0.3000, fuelTaxRate: 0.3000 },
  'TN': { code: 'TN', name: 'Tennessee', taxRate: 0.2700, fuelTaxRate: 0.2700 },
  'TX': { code: 'TX', name: 'Texas', taxRate: 0.2000, fuelTaxRate: 0.2000 },
  'UT': { code: 'UT', name: 'Utah', taxRate: 0.3140, fuelTaxRate: 0.3140 },
  'VT': { code: 'VT', name: 'Vermont', taxRate: 0.3020, fuelTaxRate: 0.3020 },
  'VA': { code: 'VA', name: 'Virginia', taxRate: 0.2720, fuelTaxRate: 0.2720 },
  'WA': { code: 'WA', name: 'Washington', taxRate: 0.4944, fuelTaxRate: 0.4944 },
  'WV': { code: 'WV', name: 'West Virginia', taxRate: 0.3570, fuelTaxRate: 0.3570 },
  'WI': { code: 'WI', name: 'Wisconsin', taxRate: 0.3290, fuelTaxRate: 0.3290 },
  'WY': { code: 'WY', name: 'Wyoming', taxRate: 0.2400, fuelTaxRate: 0.2400 }
};

// Kentucky Weight Distance Tax (KYU) rate
export const KYU_TAX_RATE = 0.0285; // $0.0285 per mile for vehicles over 59,999 lbs

// Extract state code from location string
export function extractStateCode(location: string): string {
  // Look for state abbreviations in common formats
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  if (stateMatch && STATE_TAX_RATES[stateMatch[1]]) {
    return stateMatch[1];
  }
  
  // Try to match full state names
  const lowerLocation = location.toLowerCase();
  for (const [code, info] of Object.entries(STATE_TAX_RATES)) {
    if (lowerLocation.includes(info.name.toLowerCase())) {
      return code;
    }
  }
  
  return 'UNKNOWN';
}

// Calculate MPG from trip data
export function calculateMPG(miles: number, gallons: number): number {
  if (gallons === 0) return 0;
  return miles / gallons;
}

// Calculate fuel used based on miles and average MPG
export function calculateFuelUsed(miles: number, avgMPG: number): number {
  if (avgMPG === 0) return 0;
  return miles / avgMPG;
}

// Calculate tax owed for a state
export function calculateStateTax(miles: number, avgMPG: number, stateCode: string): number {
  const fuelUsed = calculateFuelUsed(miles, avgMPG);
  const taxRate = STATE_TAX_RATES[stateCode]?.taxRate || 0;
  return fuelUsed * taxRate;
}

// Get quarter from date
export function getQuarter(date: Date): { quarter: number; year: number } {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const quarter = Math.ceil(month / 3);
  return { quarter, year: date.getFullYear() };
}

// Group trips by state
export function groupTripsByState(trips: any[]): Record<string, { miles: number; tripCount: number }> {
  const stateGroups: Record<string, { miles: number; tripCount: number }> = {};
  
  trips.forEach(trip => {
    // Try to extract state from start or end location
    const startState = extractStateCode(trip.start_location || '');
    const endState = extractStateCode(trip.end_location || '');
    
    // For now, assign full miles to the start state
    // In a more sophisticated system, you'd split miles based on route
    const state = startState !== 'UNKNOWN' ? startState : endState;
    
    if (state !== 'UNKNOWN') {
      if (!stateGroups[state]) {
        stateGroups[state] = { miles: 0, tripCount: 0 };
      }
      stateGroups[state].miles += Number(trip.miles) || 0;
      stateGroups[state].tripCount += 1;
    }
  });
  
  return stateGroups;
}

// Group fuel purchases by state
export function groupFuelByState(receipts: any[]): Record<string, { gallons: number; totalAmount: number; receiptCount: number }> {
  const fuelGroups: Record<string, { gallons: number; totalAmount: number; receiptCount: number }> = {};
  
  receipts.forEach(receipt => {
    const state = extractStateCode(receipt.location || '');
    
    if (state !== 'UNKNOWN') {
      if (!fuelGroups[state]) {
        fuelGroups[state] = { gallons: 0, totalAmount: 0, receiptCount: 0 };
      }
      fuelGroups[state].gallons += Number(receipt.gallons) || 0;
      fuelGroups[state].totalAmount += Number(receipt.total_amount) || 0;
      fuelGroups[state].receiptCount += 1;
    }
  });
  
  return fuelGroups;
}

// Main IFTA calculation function
export function calculateIFTA(
  trips: any[],
  receipts: any[],
  quarter: number,
  year: number,
  fleetAverageMPG: number = 6.5 // Default truck MPG
): IFTACalculationResult {
  // Filter data for the specific quarter
  const quarterTrips = trips.filter(trip => {
    const tripDate = new Date(trip.date);
    const tripQuarter = getQuarter(tripDate);
    return tripQuarter.quarter === quarter && tripQuarter.year === year;
  });
  
  const quarterReceipts = receipts.filter(receipt => {
    const receiptDate = new Date(receipt.receipt_date);
    const receiptQuarter = getQuarter(receiptDate);
    return receiptQuarter.quarter === quarter && receiptQuarter.year === year;
  });
  
  // Group data by state
  const stateTrips = groupTripsByState(quarterTrips);
  const stateFuel = groupFuelByState(quarterReceipts);
  
  // Get all states involved
  const allStates = new Set([...Object.keys(stateTrips), ...Object.keys(stateFuel)]);
  
  // Calculate totals
  const totalMiles = quarterTrips.reduce((sum, trip) => sum + (Number(trip.miles) || 0), 0);
  const totalFuelPurchased = quarterReceipts.reduce((sum, receipt) => sum + (Number(receipt.gallons) || 0), 0);
  
  // Calculate average MPG from actual data if available, otherwise use fleet average
  const actualMPG = totalFuelPurchased > 0 ? totalMiles / totalFuelPurchased : fleetAverageMPG;
  const averageMPG = actualMPG > 0 ? actualMPG : fleetAverageMPG;
  
  // Calculate state-by-state breakdown
  const stateBreakdown: IFTAData[] = [];
  let totalTaxOwed = 0;
  let totalFuelUsed = 0;
  let totalKyuTax = 0;
  let hasKentuckyMiles = false;
  
  Array.from(allStates).forEach(stateCode => {
    if (!STATE_TAX_RATES[stateCode]) return;
    
    const miles = stateTrips[stateCode]?.miles || 0;
    const fuelPurchased = stateFuel[stateCode]?.gallons || 0;
    const fuelUsed = calculateFuelUsed(miles, averageMPG);
    const taxOwed = calculateStateTax(miles, averageMPG, stateCode);
    const fuelTaxPaid = fuelPurchased * STATE_TAX_RATES[stateCode].taxRate;
    const netTax = taxOwed - fuelTaxPaid;
    
    // Calculate Kentucky Weight Distance Tax (KYU)
    let kyuTax = 0;
    if (stateCode === 'KY' && miles > 0) {
      kyuTax = miles * KYU_TAX_RATE;
      totalKyuTax += kyuTax;
      hasKentuckyMiles = true;
    }
    
    totalTaxOwed += taxOwed;
    totalFuelUsed += fuelUsed;
    
    if (miles > 0 || fuelPurchased > 0) {
      stateBreakdown.push({
        state: stateCode,
        miles: Math.round(miles),
        fuelPurchased: Math.round(fuelPurchased * 100) / 100,
        taxOwed: Math.round(taxOwed * 100) / 100,
        fuelUsed: Math.round(fuelUsed * 100) / 100,
        netTax: Math.round(netTax * 100) / 100,
        kyuTax: kyuTax > 0 ? Math.round(kyuTax * 100) / 100 : undefined
      });
    }
  });
  
  // Sort by miles driven (descending)
  stateBreakdown.sort((a, b) => b.miles - a.miles);
  
  // Calculate net amount (positive = owe money, negative = refund)
  const totalFuelTaxPaid = quarterReceipts.reduce((sum, receipt) => {
    const state = extractStateCode(receipt.location || '');
    const taxRate = STATE_TAX_RATES[state]?.taxRate || 0;
    return sum + ((Number(receipt.gallons) || 0) * taxRate);
  }, 0);
  
  const netAmount = totalTaxOwed - totalFuelTaxPaid;
  
  return {
    quarter,
    year,
    totalMiles: Math.round(totalMiles),
    totalFuelPurchased: Math.round(totalFuelPurchased * 100) / 100,
    totalTaxOwed: Math.round(totalTaxOwed * 100) / 100,
    totalFuelUsed: Math.round(totalFuelUsed * 100) / 100,
    averageMPG: Math.round(averageMPG * 100) / 100,
    stateBreakdown,
    netAmount: Math.round(netAmount * 100) / 100,
    totalKyuTax: totalKyuTax > 0 ? Math.round(totalKyuTax * 100) / 100 : undefined,
    hasKentuckyMiles
  };
}

// Get current quarter
export function getCurrentQuarter(): { quarter: number; year: number } {
  return getQuarter(new Date());
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format miles
export function formatMiles(miles: number): string {
  return new Intl.NumberFormat('en-US').format(miles);
}