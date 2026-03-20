import { VoiceCommand } from './types';

export const voiceCommands: VoiceCommand[] = [
  // === NAVIGATION ===
  {
    patterns: ['go to dashboard', 'open dashboard', 'show dashboard', 'take me to dashboard', 'home'],
    action: 'navigate_dashboard',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening your dashboard.',
    navigateTo: '/dashboard',
  },
  {
    patterns: ['open my reports', 'go to reports', 'show my reports', 'show reports', 'open reports', 'my reports'],
    action: 'navigate_reports',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening your reports.',
    navigateTo: '/reports',
  },
  {
    patterns: ['open ifta reports', 'go to ifta', 'show ifta', 'ifta reports'],
    action: 'navigate_ifta',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening your IFTA reports.',
    navigateTo: '/ifta-reports',
  },
  {
    patterns: ['show my mileage', 'open mileage', 'go to mileage', 'mileage tracker', 'show mileage'],
    action: 'navigate_mileage',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening mileage tracker.',
    navigateTo: '/mileage-tracker',
  },
  {
    patterns: ['open scanner', 'scan receipt', 'go to scanner', 'receipt scanner'],
    action: 'navigate_scanner',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening receipt scanner. Point your camera at the fuel receipt when ready.',
    navigateTo: '/scan-receipt',
  },
  {
    patterns: ['go to messages', 'open messages', 'show messages', 'my messages'],
    action: 'navigate_messages',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening your messages.',
    navigateTo: '/messages',
  },
  {
    patterns: ['show notifications', 'open notifications', 'my notifications', 'alerts'],
    action: 'navigate_notifications',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening notifications.',
    navigateTo: '/notifications',
  },
  {
    patterns: ['open help', 'go to help', 'help center', 'need help', 'help me'],
    action: 'navigate_help',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening the help center.',
    navigateTo: '/help',
  },
  {
    patterns: ['show analytics', 'open analytics', 'go to analytics', 'my analytics'],
    action: 'navigate_analytics',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening analytics.',
    navigateTo: '/analytics',
  },
  {
    patterns: ['go to settings', 'open settings', 'account settings', 'my account'],
    action: 'navigate_settings',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening your account settings.',
    navigateTo: '/account',
  },
  {
    patterns: ['open pricing', 'show pricing', 'go to pricing', 'pricing plans'],
    action: 'navigate_pricing',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening pricing plans.',
    navigateTo: '/pricing',
  },
  {
    patterns: ['open trips', 'go to trips', 'trip management', 'my trips', 'show trips'],
    action: 'navigate_trips',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening trip management.',
    navigateTo: '/trips',
  },
  {
    patterns: ['open vehicles', 'go to vehicles', 'my vehicles', 'show vehicles', 'my trucks'],
    action: 'navigate_vehicles',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening vehicle management.',
    navigateTo: '/vehicles',
  },
  {
    patterns: ['open fleet', 'fleet dashboard', 'go to fleet', 'my fleet'],
    action: 'navigate_fleet',
    category: 'navigation',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Opening fleet dashboard.',
    navigateTo: '/fleet-dashboard',
  },

  // === TRIP COMMANDS ===
  {
    patterns: ['start a trip', 'start trip', 'begin trip', 'new trip', 'start driving'],
    action: 'start_trip',
    category: 'trip',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Trip started. GPS tracking is on. Drive safe!',
    handler: 'handleStartTrip',
  },
  {
    patterns: ['end my trip', 'end trip', 'stop trip', 'finish trip', 'done driving'],
    action: 'end_trip',
    category: 'trip',
    requiresConfirmation: true,
    offlineCapable: true,
    response: 'Trip ended. Great drive!',
    handler: 'handleEndTrip',
  },
  {
    patterns: ['log a fuel stop', 'fuel stop', 'log fuel', 'bought fuel', 'got fuel'],
    action: 'log_fuel',
    category: 'trip',
    requiresConfirmation: false,
    offlineCapable: false,
    response: 'Opening scanner. Point camera at your fuel receipt when ready.',
    navigateTo: '/scan-receipt',
  },
  {
    patterns: ['how many miles today', 'miles today', 'today miles', 'miles driven today'],
    action: 'miles_today',
    category: 'trip',
    requiresConfirmation: false,
    offlineCapable: false,
    response: 'Let me check your miles for today.',
    handler: 'handleMilesToday',
  },
  {
    patterns: ['what state am i in', 'which state', 'current state', 'where am i'],
    action: 'current_state',
    category: 'trip',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Let me check your GPS location.',
    handler: 'handleCurrentState',
  },

  // === IFTA COMMANDS ===
  {
    patterns: ['when is my ifta due', 'ifta deadline', 'when is ifta due', 'filing deadline', 'next deadline', 'what is my next deadline'],
    action: 'ifta_deadline',
    category: 'ifta',
    requiresConfirmation: false,
    offlineCapable: false,
    response: '',
    handler: 'handleIFTADeadline',
  },
  {
    patterns: ['how much ifta do i owe', 'ifta tax', 'how much do i owe', 'my ifta balance', 'tax owed'],
    action: 'ifta_balance',
    category: 'ifta',
    requiresConfirmation: false,
    offlineCapable: false,
    response: '',
    handler: 'handleIFTABalance',
  },
  {
    patterns: ['generate my ifta report', 'generate report', 'create report', 'make my report'],
    action: 'generate_report',
    category: 'ifta',
    requiresConfirmation: true,
    offlineCapable: false,
    response: 'Opening your IFTA reports to generate a new report.',
    navigateTo: '/ifta-reports',
  },
  {
    patterns: ['submit my ifta report', 'submit report', 'file my report', 'file ifta'],
    action: 'submit_report',
    category: 'ifta',
    requiresConfirmation: true,
    offlineCapable: false,
    response: 'Opening your IFTA report for final review before submission.',
    navigateTo: '/ifta-reports',
  },
  {
    patterns: ['show my filing history', 'filing history', 'past reports', 'old reports'],
    action: 'filing_history',
    category: 'ifta',
    requiresConfirmation: false,
    offlineCapable: false,
    response: 'Opening your filing history.',
    navigateTo: '/ifta-reports',
  },
  {
    patterns: ['show my stats', 'my stats', 'quarterly stats', 'my statistics'],
    action: 'show_stats',
    category: 'info',
    requiresConfirmation: false,
    offlineCapable: false,
    response: '',
    handler: 'handleShowStats',
  },
  {
    patterns: ['am i on track', 'report status', 'am i ready to file', 'report progress'],
    action: 'on_track',
    category: 'info',
    requiresConfirmation: false,
    offlineCapable: false,
    response: '',
    handler: 'handleOnTrack',
  },

  // === MESSAGE COMMANDS ===
  {
    patterns: ['read my messages', 'read messages', 'any messages', 'check messages', 'unread messages'],
    action: 'read_messages',
    category: 'message',
    requiresConfirmation: false,
    offlineCapable: false,
    response: '',
    handler: 'handleReadMessages',
  },

  // === BOL COMMANDS ===
  {
    patterns: ['scan a bol', 'scan bol', 'bill of lading', 'scan bill of lading'],
    action: 'scan_bol',
    category: 'bol',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'BOL scanner is ready. Point your camera at the Bill of Lading when safe to do so.',
    navigateTo: '/bol-management',
  },
  {
    patterns: ['show my bols', 'my bols', 'bol library', 'bills of lading'],
    action: 'show_bols',
    category: 'bol',
    requiresConfirmation: false,
    offlineCapable: false,
    response: 'Opening your Bill of Lading library.',
    navigateTo: '/bol-management',
  },

  // === INFO COMMANDS ===
  {
    patterns: ['what is ifta', 'explain ifta', 'tell me about ifta'],
    action: 'what_is_ifta',
    category: 'info',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'IFTA stands for International Fuel Tax Agreement. It lets truck drivers who operate in multiple states pay fuel taxes fairly based on where they drive. You file one quarterly report with your home state and they handle the rest. You need IFTA if you drive a commercial vehicle over 26,000 pounds across state lines.',
  },
  {
    patterns: ['call support', 'contact support', 'talk to someone', 'speak to support', 'get help'],
    action: 'call_support',
    category: 'info',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'You can reach TrueTrucker support at 321-395-9957 or email support@true-trucker-ifta-pro.com. Hours are Monday through Friday, 9AM to 5PM Eastern.',
  },

  // === SETTINGS COMMANDS ===
  {
    patterns: ['turn on gps', 'enable gps', 'start gps', 'gps on'],
    action: 'gps_on',
    category: 'settings',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'GPS tracking is now on. Your miles are being tracked.',
    handler: 'handleGPSOn',
  },
  {
    patterns: ['turn off gps', 'disable gps', 'stop gps', 'gps off'],
    action: 'gps_off',
    category: 'settings',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'GPS tracking is off. Remember to log miles manually.',
    handler: 'handleGPSOff',
  },
  {
    patterns: ['turn off voice', 'disable voice', 'voice off', 'stop voice', 'mute'],
    action: 'voice_off',
    category: 'settings',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Voice commands disabled. Tap the mic button to re-enable anytime.',
    handler: 'handleVoiceOff',
  },
  {
    patterns: ['driving mode on', 'start driving mode', 'enable driving mode', 'hands free mode'],
    action: 'driving_mode_on',
    category: 'settings',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Driving mode is on. I will handle everything by voice. Drive safe!',
    handler: 'handleDrivingModeOn',
  },
  {
    patterns: ['driving mode off', 'stop driving mode', 'disable driving mode', 'exit driving mode'],
    action: 'driving_mode_off',
    category: 'settings',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Driving mode is off. You can use the app normally now.',
    handler: 'handleDrivingModeOff',
  },
  {
    patterns: ['log me out', 'sign out', 'logout', 'sign me out'],
    action: 'logout',
    category: 'settings',
    requiresConfirmation: true,
    offlineCapable: true,
    response: 'Are you sure you want to log out? Say YES or NO.',
    handler: 'handleLogout',
  },

  // === VOICE HELP ===
  {
    patterns: ['help', 'voice help', 'what can i say', 'voice commands', 'list commands'],
    action: 'voice_help',
    category: 'info',
    requiresConfirmation: false,
    offlineCapable: true,
    response: 'Here are some commands you can use: Go to dashboard. Open my reports. Start a trip. When is my IFTA due. Read my messages. Scan a receipt. You can say any of these after Hey Trucker.',
  },
];

/**
 * Match spoken text to a command. Returns best match or null.
 */
export function matchCommand(spoken: string): { command: VoiceCommand; confidence: number } | null {
  const normalized = spoken.toLowerCase().trim()
    .replace(/^(hey trucker|oye trucker)\s*[-—,.]?\s*/i, '') // strip wake word
    .replace(/[.,!?]/g, '')
    .trim();

  if (!normalized) return null;

  let bestMatch: VoiceCommand | null = null;
  let bestScore = 0;

  for (const cmd of voiceCommands) {
    for (const pattern of cmd.patterns) {
      const score = similarityScore(normalized, pattern);
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = cmd;
      }
    }
  }

  return bestMatch ? { command: bestMatch, confidence: bestScore } : null;
}

/**
 * Simple similarity scoring using word overlap + substring matching
 */
function similarityScore(input: string, pattern: string): number {
  // Exact match
  if (input === pattern) return 1.0;

  // Contains full pattern
  if (input.includes(pattern)) return 0.95;
  if (pattern.includes(input) && input.length > 3) return 0.85;

  // Word overlap
  const inputWords = input.split(/\s+/);
  const patternWords = pattern.split(/\s+/);
  const matchingWords = patternWords.filter(pw =>
    inputWords.some(iw => iw === pw || (iw.length > 3 && pw.includes(iw)) || (pw.length > 3 && iw.includes(pw)))
  );

  const overlapScore = matchingWords.length / patternWords.length;

  // Bonus for matching key words
  const keyWords = ['dashboard', 'reports', 'mileage', 'scanner', 'messages', 'trip', 'ifta',
    'deadline', 'owe', 'fuel', 'bol', 'help', 'gps', 'driving', 'stats', 'notifications',
    'analytics', 'vehicles', 'fleet', 'pricing', 'settings', 'logout', 'scan', 'receipt'];
  const hasKeyWord = keyWords.some(kw => input.includes(kw) && pattern.includes(kw));

  return hasKeyWord ? Math.min(overlapScore + 0.3, 1.0) : overlapScore;
}

/**
 * Check if spoken text contains a wake word
 */
export function containsWakeWord(spoken: string, wakeWord: string = 'hey trucker'): boolean {
  const normalized = spoken.toLowerCase().trim();
  return normalized.startsWith(wakeWord) || normalized.includes(wakeWord);
}
