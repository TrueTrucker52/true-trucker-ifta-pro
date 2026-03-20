import { VoiceSettings } from './types';

class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private settings: Partial<VoiceSettings> = {};

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  updateSettings(settings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.settings.voice_speed || 1.0;
    utterance.volume = this.settings.voice_volume || 0.8;
    utterance.lang = this.settings.language || 'en-US';

    // Select voice based on gender preference
    const voices = this.synth.getVoices();
    const preferFemale = (this.settings.voice_gender || 'female') === 'female';
    const langVoices = voices.filter(v => v.lang.startsWith(utterance.lang.split('-')[0]));

    if (langVoices.length > 0) {
      const genderMatch = langVoices.find(v => {
        const name = v.name.toLowerCase();
        return preferFemale
          ? name.includes('female') || name.includes('samantha') || name.includes('victoria') || name.includes('karen') || name.includes('google us english')
          : name.includes('male') || name.includes('daniel') || name.includes('alex') || name.includes('david');
      });
      utterance.voice = genderMatch || langVoices[0];
    }

    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => onEnd?.();

    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth?.cancel();
  }

  get isSupported(): boolean {
    return !!this.synth;
  }
}

export const ttsEngine = new TTSEngine();
