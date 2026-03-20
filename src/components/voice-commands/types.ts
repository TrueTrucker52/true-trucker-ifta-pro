export interface VoiceCommand {
  patterns: string[];
  action: string;
  category: 'navigation' | 'trip' | 'ifta' | 'message' | 'bol' | 'info' | 'settings';
  requiresConfirmation: boolean;
  offlineCapable: boolean;
  response: string;
  handler?: string; // method name to call
  navigateTo?: string;
  extractParams?: string[]; // named capture groups
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceSettings {
  voice_enabled: boolean;
  voice_speed: number;
  voice_volume: number;
  voice_gender: 'female' | 'male';
  wake_word: string;
  read_messages_aloud: boolean;
  announce_state_crossings: boolean;
  fuel_stop_reminders: boolean;
  auto_driving_mode: boolean;
  language: string;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice_enabled: false,
  voice_speed: 1.0,
  voice_volume: 0.8,
  voice_gender: 'female',
  wake_word: 'hey trucker',
  read_messages_aloud: true,
  announce_state_crossings: true,
  fuel_stop_reminders: true,
  auto_driving_mode: false,
  language: 'en-US',
};
