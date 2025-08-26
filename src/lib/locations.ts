// Common trucking locations and cities database
export interface LocationData {
  city: string;
  state: string;
  stateCode: string;
  type: 'major_city' | 'port' | 'distribution_center' | 'truck_stop' | 'border_crossing';
  displayName: string;
}

export const COMMON_LOCATIONS: LocationData[] = [
  // Major Cities
  { city: 'Los Angeles', state: 'California', stateCode: 'CA', type: 'major_city', displayName: 'Los Angeles, CA' },
  { city: 'Long Beach', state: 'California', stateCode: 'CA', type: 'port', displayName: 'Long Beach, CA (Port)' },
  { city: 'Oakland', state: 'California', stateCode: 'CA', type: 'port', displayName: 'Oakland, CA (Port)' },
  { city: 'Phoenix', state: 'Arizona', stateCode: 'AZ', type: 'major_city', displayName: 'Phoenix, AZ' },
  { city: 'Tucson', state: 'Arizona', stateCode: 'AZ', type: 'major_city', displayName: 'Tucson, AZ' },
  { city: 'Las Vegas', state: 'Nevada', stateCode: 'NV', type: 'major_city', displayName: 'Las Vegas, NV' },
  { city: 'Reno', state: 'Nevada', stateCode: 'NV', type: 'major_city', displayName: 'Reno, NV' },
  { city: 'Denver', state: 'Colorado', stateCode: 'CO', type: 'major_city', displayName: 'Denver, CO' },
  { city: 'Colorado Springs', state: 'Colorado', stateCode: 'CO', type: 'major_city', displayName: 'Colorado Springs, CO' },
  { city: 'Salt Lake City', state: 'Utah', stateCode: 'UT', type: 'major_city', displayName: 'Salt Lake City, UT' },
  { city: 'Albuquerque', state: 'New Mexico', stateCode: 'NM', type: 'major_city', displayName: 'Albuquerque, NM' },
  { city: 'El Paso', state: 'Texas', stateCode: 'TX', type: 'border_crossing', displayName: 'El Paso, TX (Border)' },
  { city: 'Dallas', state: 'Texas', stateCode: 'TX', type: 'major_city', displayName: 'Dallas, TX' },
  { city: 'Houston', state: 'Texas', stateCode: 'TX', type: 'port', displayName: 'Houston, TX (Port)' },
  { city: 'San Antonio', state: 'Texas', stateCode: 'TX', type: 'major_city', displayName: 'San Antonio, TX' },
  { city: 'Austin', state: 'Texas', stateCode: 'TX', type: 'major_city', displayName: 'Austin, TX' },
  { city: 'Oklahoma City', state: 'Oklahoma', stateCode: 'OK', type: 'major_city', displayName: 'Oklahoma City, OK' },
  { city: 'Tulsa', state: 'Oklahoma', stateCode: 'OK', type: 'major_city', displayName: 'Tulsa, OK' },
  { city: 'Kansas City', state: 'Missouri', stateCode: 'MO', type: 'major_city', displayName: 'Kansas City, MO' },
  { city: 'St. Louis', state: 'Missouri', stateCode: 'MO', type: 'major_city', displayName: 'St. Louis, MO' },
  { city: 'Little Rock', state: 'Arkansas', stateCode: 'AR', type: 'major_city', displayName: 'Little Rock, AR' },
  { city: 'Memphis', state: 'Tennessee', stateCode: 'TN', type: 'major_city', displayName: 'Memphis, TN' },
  { city: 'Nashville', state: 'Tennessee', stateCode: 'TN', type: 'major_city', displayName: 'Nashville, TN' },
  { city: 'Louisville', state: 'Kentucky', stateCode: 'KY', type: 'major_city', displayName: 'Louisville, KY' },
  { city: 'Lexington', state: 'Kentucky', stateCode: 'KY', type: 'major_city', displayName: 'Lexington, KY' },
  { city: 'Indianapolis', state: 'Indiana', stateCode: 'IN', type: 'major_city', displayName: 'Indianapolis, IN' },
  { city: 'Chicago', state: 'Illinois', stateCode: 'IL', type: 'major_city', displayName: 'Chicago, IL' },
  { city: 'Milwaukee', state: 'Wisconsin', stateCode: 'WI', type: 'major_city', displayName: 'Milwaukee, WI' },
  { city: 'Minneapolis', state: 'Minnesota', stateCode: 'MN', type: 'major_city', displayName: 'Minneapolis, MN' },
  { city: 'Des Moines', state: 'Iowa', stateCode: 'IA', type: 'major_city', displayName: 'Des Moines, IA' },
  { city: 'Omaha', state: 'Nebraska', stateCode: 'NE', type: 'major_city', displayName: 'Omaha, NE' },
  { city: 'Wichita', state: 'Kansas', stateCode: 'KS', type: 'major_city', displayName: 'Wichita, KS' },
  { city: 'Detroit', state: 'Michigan', stateCode: 'MI', type: 'major_city', displayName: 'Detroit, MI' },
  { city: 'Grand Rapids', state: 'Michigan', stateCode: 'MI', type: 'major_city', displayName: 'Grand Rapids, MI' },
  { city: 'Columbus', state: 'Ohio', stateCode: 'OH', type: 'major_city', displayName: 'Columbus, OH' },
  { city: 'Cleveland', state: 'Ohio', stateCode: 'OH', type: 'major_city', displayName: 'Cleveland, OH' },
  { city: 'Cincinnati', state: 'Ohio', stateCode: 'OH', type: 'major_city', displayName: 'Cincinnati, OH' },
  { city: 'Pittsburgh', state: 'Pennsylvania', stateCode: 'PA', type: 'major_city', displayName: 'Pittsburgh, PA' },
  { city: 'Philadelphia', state: 'Pennsylvania', stateCode: 'PA', type: 'major_city', displayName: 'Philadelphia, PA' },
  { city: 'New York', state: 'New York', stateCode: 'NY', type: 'major_city', displayName: 'New York, NY' },
  { city: 'Buffalo', state: 'New York', stateCode: 'NY', type: 'major_city', displayName: 'Buffalo, NY' },
  { city: 'Albany', state: 'New York', stateCode: 'NY', type: 'major_city', displayName: 'Albany, NY' },
  { city: 'Boston', state: 'Massachusetts', stateCode: 'MA', type: 'major_city', displayName: 'Boston, MA' },
  { city: 'Hartford', state: 'Connecticut', stateCode: 'CT', type: 'major_city', displayName: 'Hartford, CT' },
  { city: 'Providence', state: 'Rhode Island', stateCode: 'RI', type: 'major_city', displayName: 'Providence, RI' },
  { city: 'Portland', state: 'Maine', stateCode: 'ME', type: 'major_city', displayName: 'Portland, ME' },
  { city: 'Burlington', state: 'Vermont', stateCode: 'VT', type: 'major_city', displayName: 'Burlington, VT' },
  { city: 'Manchester', state: 'New Hampshire', stateCode: 'NH', type: 'major_city', displayName: 'Manchester, NH' },
  { city: 'Newark', state: 'New Jersey', stateCode: 'NJ', type: 'port', displayName: 'Newark, NJ (Port)' },
  { city: 'Trenton', state: 'New Jersey', stateCode: 'NJ', type: 'major_city', displayName: 'Trenton, NJ' },
  { city: 'Wilmington', state: 'Delaware', stateCode: 'DE', type: 'major_city', displayName: 'Wilmington, DE' },
  { city: 'Baltimore', state: 'Maryland', stateCode: 'MD', type: 'port', displayName: 'Baltimore, MD (Port)' },
  { city: 'Washington', state: 'District of Columbia', stateCode: 'DC', type: 'major_city', displayName: 'Washington, DC' },
  { city: 'Richmond', state: 'Virginia', stateCode: 'VA', type: 'major_city', displayName: 'Richmond, VA' },
  { city: 'Norfolk', state: 'Virginia', stateCode: 'VA', type: 'port', displayName: 'Norfolk, VA (Port)' },
  { city: 'Charlotte', state: 'North Carolina', stateCode: 'NC', type: 'major_city', displayName: 'Charlotte, NC' },
  { city: 'Raleigh', state: 'North Carolina', stateCode: 'NC', type: 'major_city', displayName: 'Raleigh, NC' },
  { city: 'Columbia', state: 'South Carolina', stateCode: 'SC', type: 'major_city', displayName: 'Columbia, SC' },
  { city: 'Charleston', state: 'South Carolina', stateCode: 'SC', type: 'port', displayName: 'Charleston, SC (Port)' },
  { city: 'Atlanta', state: 'Georgia', stateCode: 'GA', type: 'major_city', displayName: 'Atlanta, GA' },
  { city: 'Savannah', state: 'Georgia', stateCode: 'GA', type: 'port', displayName: 'Savannah, GA (Port)' },
  { city: 'Jacksonville', state: 'Florida', stateCode: 'FL', type: 'port', displayName: 'Jacksonville, FL (Port)' },
  { city: 'Tampa', state: 'Florida', stateCode: 'FL', type: 'major_city', displayName: 'Tampa, FL' },
  { city: 'Miami', state: 'Florida', stateCode: 'FL', type: 'port', displayName: 'Miami, FL (Port)' },
  { city: 'Orlando', state: 'Florida', stateCode: 'FL', type: 'major_city', displayName: 'Orlando, FL' },
  { city: 'Tallahassee', state: 'Florida', stateCode: 'FL', type: 'major_city', displayName: 'Tallahassee, FL' },
  { city: 'Mobile', state: 'Alabama', stateCode: 'AL', type: 'port', displayName: 'Mobile, AL (Port)' },
  { city: 'Birmingham', state: 'Alabama', stateCode: 'AL', type: 'major_city', displayName: 'Birmingham, AL' },
  { city: 'Montgomery', state: 'Alabama', stateCode: 'AL', type: 'major_city', displayName: 'Montgomery, AL' },
  { city: 'Jackson', state: 'Mississippi', stateCode: 'MS', type: 'major_city', displayName: 'Jackson, MS' },
  { city: 'New Orleans', state: 'Louisiana', stateCode: 'LA', type: 'port', displayName: 'New Orleans, LA (Port)' },
  { city: 'Baton Rouge', state: 'Louisiana', stateCode: 'LA', type: 'major_city', displayName: 'Baton Rouge, LA' },
  { city: 'Shreveport', state: 'Louisiana', stateCode: 'LA', type: 'major_city', displayName: 'Shreveport, LA' },
  
  // Major Distribution Centers
  { city: 'Laredo', state: 'Texas', stateCode: 'TX', type: 'border_crossing', displayName: 'Laredo, TX (Border/Distribution)' },
  { city: 'McAllen', state: 'Texas', stateCode: 'TX', type: 'border_crossing', displayName: 'McAllen, TX (Border)' },
  { city: 'Brownsville', state: 'Texas', stateCode: 'TX', type: 'border_crossing', displayName: 'Brownsville, TX (Border)' },
  
  // West Coast
  { city: 'Seattle', state: 'Washington', stateCode: 'WA', type: 'port', displayName: 'Seattle, WA (Port)' },
  { city: 'Tacoma', state: 'Washington', stateCode: 'WA', type: 'port', displayName: 'Tacoma, WA (Port)' },
  { city: 'Spokane', state: 'Washington', stateCode: 'WA', type: 'major_city', displayName: 'Spokane, WA' },
  { city: 'Portland', state: 'Oregon', stateCode: 'OR', type: 'port', displayName: 'Portland, OR (Port)' },
  { city: 'Eugene', state: 'Oregon', stateCode: 'OR', type: 'major_city', displayName: 'Eugene, OR' },
  { city: 'San Francisco', state: 'California', stateCode: 'CA', type: 'major_city', displayName: 'San Francisco, CA' },
  { city: 'Sacramento', state: 'California', stateCode: 'CA', type: 'major_city', displayName: 'Sacramento, CA' },
  { city: 'Fresno', state: 'California', stateCode: 'CA', type: 'major_city', displayName: 'Fresno, CA' },
  { city: 'Bakersfield', state: 'California', stateCode: 'CA', type: 'major_city', displayName: 'Bakersfield, CA' },
  { city: 'San Diego', state: 'California', stateCode: 'CA', type: 'major_city', displayName: 'San Diego, CA' },
  
  // Mountain/Northern States
  { city: 'Boise', state: 'Idaho', stateCode: 'ID', type: 'major_city', displayName: 'Boise, ID' },
  { city: 'Billings', state: 'Montana', stateCode: 'MT', type: 'major_city', displayName: 'Billings, MT' },
  { city: 'Missoula', state: 'Montana', stateCode: 'MT', type: 'major_city', displayName: 'Missoula, MT' },
  { city: 'Fargo', state: 'North Dakota', stateCode: 'ND', type: 'major_city', displayName: 'Fargo, ND' },
  { city: 'Sioux Falls', state: 'South Dakota', stateCode: 'SD', type: 'major_city', displayName: 'Sioux Falls, SD' },
  { city: 'Cheyenne', state: 'Wyoming', stateCode: 'WY', type: 'major_city', displayName: 'Cheyenne, WY' },
  { city: 'Casper', state: 'Wyoming', stateCode: 'WY', type: 'major_city', displayName: 'Casper, WY' },
  
  // Alaska & Hawaii
  { city: 'Anchorage', state: 'Alaska', stateCode: 'AK', type: 'major_city', displayName: 'Anchorage, AK' },
  { city: 'Honolulu', state: 'Hawaii', stateCode: 'HI', type: 'port', displayName: 'Honolulu, HI (Port)' }
];

// Function to search locations
export function searchLocations(query: string): LocationData[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  
  // Handle comma-separated input (e.g., "atlanta,georgia" or "atlanta, ga")
  const parts = lowerQuery.split(',').map(part => part.trim());
  
  return COMMON_LOCATIONS
    .filter(location => {
      const cityMatch = location.city.toLowerCase().includes(parts[0]);
      
      // If there's a second part after comma, check state/state code
      if (parts.length > 1 && parts[1]) {
        const stateMatch = 
          location.state.toLowerCase().includes(parts[1]) ||
          location.stateCode.toLowerCase().includes(parts[1]);
        return cityMatch && stateMatch;
      }
      
      // Single search term - check all fields
      return (
        location.city.toLowerCase().includes(lowerQuery) ||
        location.state.toLowerCase().includes(lowerQuery) ||
        location.stateCode.toLowerCase().includes(lowerQuery) ||
        location.displayName.toLowerCase().includes(lowerQuery)
      );
    })
    .sort((a, b) => {
      // Prioritize exact city matches
      const queryStart = parts[0] || lowerQuery;
      if (a.city.toLowerCase().startsWith(queryStart)) return -1;
      if (b.city.toLowerCase().startsWith(queryStart)) return 1;
      return a.displayName.localeCompare(b.displayName);
    })
    .slice(0, 10); // Limit results
}

// Function to extract state code from location string
export function extractStateFromLocation(location: string): string {
  // Try to find state code in various formats
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    return stateMatch[1];
  }
  
  // Look for state name
  const found = COMMON_LOCATIONS.find(loc => 
    location.toLowerCase().includes(loc.city.toLowerCase()) &&
    location.toLowerCase().includes(loc.state.toLowerCase())
  );
  
  return found ? found.stateCode : '';
}

// Function to format location consistently
export function formatLocation(city: string, stateCode: string): string {
  return `${city}, ${stateCode.toUpperCase()}`;
}

// Function to validate location format
export function isValidLocationFormat(location: string): boolean {
  // Check for "City, ST" format
  const pattern = /^.+,\s*[A-Z]{2}$/;
  return pattern.test(location);
}