import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VoiceState, VoiceSettings, DEFAULT_VOICE_SETTINGS } from './types';
import { matchCommand, containsWakeWord } from './commandLibrary';
import { ttsEngine } from './ttsEngine';

export function useVoiceCommands() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [drivingMode, setDrivingMode] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<(() => void) | null>(null);
  const [showSafetyDisclaimer, setShowSafetyDisclaimer] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const recognitionRef = useRef<any>(null);
  const wakeWordRecognitionRef = useRef<any>(null);
  const pendingTimeoutsRef = useRef<number[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const settingsLoadedRef = useRef(false);

  const registerTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter((id) => id !== timeoutId);
      callback();
    }, delay);

    pendingTimeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  const clearPendingTimeouts = useCallback(() => {
    pendingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    pendingTimeoutsRef.current = [];
  }, []);

  // Load settings from Supabase
  useEffect(() => {
    if (!user || settingsLoadedRef.current) return;
    settingsLoadedRef.current = true;

    const loadSettings = async () => {
      const { data } = await supabase
        .from('voice_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const loaded: VoiceSettings = {
          voice_enabled: data.voice_enabled,
          voice_speed: Number(data.voice_speed),
          voice_volume: Number(data.voice_volume),
          voice_gender: data.voice_gender as 'female' | 'male',
          wake_word: data.wake_word,
          read_messages_aloud: data.read_messages_aloud,
          announce_state_crossings: data.announce_state_crossings,
          fuel_stop_reminders: data.fuel_stop_reminders,
          auto_driving_mode: data.auto_driving_mode,
          language: data.language,
        };
        setSettings(loaded);
        ttsEngine.updateSettings(loaded);
      }
    };
    loadSettings();
  }, [user]);

  const saveSettings = useCallback(async (newSettings: VoiceSettings) => {
    if (!user) return;
    setSettings(newSettings);
    ttsEngine.updateSettings(newSettings);

    await supabase
      .from('voice_settings')
      .upsert({
        user_id: user.id,
        ...newSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }, [user]);

  const logCommand = useCallback(async (spoken: string, matched: string | null, success: boolean, confidence: number | null) => {
    if (!user) return;
    await supabase.from('voice_commands').insert({
      user_id: user.id,
      command_spoken: spoken,
      command_matched: matched,
      page_context: location.pathname,
      was_successful: success,
      confidence_score: confidence,
    });
  }, [user, location.pathname]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    ttsEngine.speak(text, onEnd);
  }, []);

  // === Command handlers ===
  const handleIFTADeadline = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const deadlines = [
      { q: 1, date: new Date(year, 3, 30), label: `Q1 ${year}` },
      { q: 2, date: new Date(year, 6, 31), label: `Q2 ${year}` },
      { q: 3, date: new Date(year, 9, 31), label: `Q3 ${year}` },
      { q: 4, date: new Date(year + 1, 0, 31), label: `Q4 ${year}` },
    ];
    const next = deadlines.find(d => d.date > now) || deadlines[0];
    const daysLeft = Math.ceil((next.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dateStr = next.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `Your ${next.label} IFTA report is due ${dateStr}. That's ${daysLeft} days from today. Want me to open your reports?`;
  }, []);

  const handleIFTABalance = useCallback(() => {
    return "Let me check your IFTA balance. Opening your IFTA reports for the latest calculations.";
  }, []);

  const handleShowStats = useCallback(() => {
    return "Opening your analytics to show your quarterly stats.";
  }, []);

  const handleOnTrack = useCallback(() => {
    return "Let me check your report progress. Opening your IFTA reports.";
  }, []);

  const handleReadMessages = useCallback(() => {
    navigate('/messages');
    return "Opening your messages.";
  }, [navigate]);

  const handleCurrentState = useCallback(async () => {
    if (!navigator.geolocation) return "GPS is not available on this device.";
    return "Checking your GPS location. Please check the mileage tracker for your current state.";
  }, []);

  const handleStartTrip = useCallback(() => {
    navigate('/trips');
    return "Opening trip management to start a new trip. GPS tracking will begin when you create the trip.";
  }, [navigate]);

  const handleEndTrip = useCallback(() => {
    navigate('/trips');
    return "Opening trip management to end your current trip.";
  }, [navigate]);

  const handleMilesToday = useCallback(() => {
    navigate('/mileage-tracker');
    return "Opening your mileage tracker to check today's miles.";
  }, [navigate]);

  const handleGPSOn = useCallback(() => {
    navigate('/mileage-tracker');
    return "GPS tracking is now on. Opening mileage tracker.";
  }, [navigate]);

  const handleGPSOff = useCallback(() => {
    return "GPS tracking is off. Remember to log miles manually.";
  }, []);

  const handleVoiceOff = useCallback(() => {
    const newSettings = { ...settings, voice_enabled: false };
    saveSettings(newSettings);
    stopWakeWordListening();
    return "Voice commands disabled. Tap the mic button to re-enable anytime.";
  }, [settings, saveSettings]);

  const handleDrivingModeOn = useCallback(() => {
    setDrivingMode(true);
    return "Driving mode is on. I'll handle everything by voice. Drive safe!";
  }, []);

  const handleDrivingModeOff = useCallback(() => {
    setDrivingMode(false);
    return "Driving mode is off. You can use the app normally now.";
  }, []);

  const handleLogout = useCallback(() => {
    setPendingConfirmation(() => async () => {
      await signOut();
      navigate('/');
    });
    return "Are you sure you want to log out? Say YES or NO.";
  }, [signOut, navigate]);

  const handlers: Record<string, () => string | Promise<string>> = {
    handleIFTADeadline,
    handleIFTABalance,
    handleShowStats,
    handleOnTrack,
    handleReadMessages,
    handleCurrentState,
    handleStartTrip,
    handleEndTrip,
    handleMilesToday,
    handleGPSOn,
    handleGPSOff,
    handleVoiceOff,
    handleDrivingModeOn,
    handleDrivingModeOff,
    handleLogout,
  };

  // Process a spoken command
  const processCommand = useCallback(async (spoken: string) => {
    setVoiceState('processing');
    setLastTranscript(spoken);

    // Handle pending confirmation (YES/NO)
    if (pendingConfirmation) {
      const lw = spoken.toLowerCase().trim();
      if (lw === 'yes' || lw === 'yeah' || lw === 'yep' || lw === 'confirm') {
        pendingConfirmation();
        setPendingConfirmation(null);
        setVoiceState('success');
        speak('Done!');
        logCommand(spoken, 'confirmation_yes', true, 1.0);
        return;
      } else {
        setPendingConfirmation(null);
        setVoiceState('idle');
        speak('Cancelled.');
        logCommand(spoken, 'confirmation_no', true, 1.0);
        return;
      }
    }

    const result = matchCommand(spoken);

    if (!result) {
      setVoiceState('error');
      const errorMsg = "Sorry, I didn't catch that. Try saying: Go to dashboard, check my deadline, or log a fuel stop.";
      setLastResponse(errorMsg);
      speak(errorMsg);
      logCommand(spoken, null, false, 0);
        registerTimeout(() => setVoiceState('idle'), 3000);
      return;
    }

    const { command, confidence } = result;

    // Execute handler if present
    let responseText = command.response;
    if (command.handler && handlers[command.handler]) {
      const handlerResult = handlers[command.handler]();
      if (handlerResult instanceof Promise) {
        responseText = await handlerResult;
      } else {
        responseText = handlerResult;
      }
    }

    // Navigate if specified
    if (command.navigateTo) {
      if (command.requiresConfirmation) {
        setPendingConfirmation(() => () => navigate(command.navigateTo!));
        responseText = `${responseText} Say YES to confirm or NO to cancel.`;
      } else {
        navigate(command.navigateTo);
      }
    }

    setLastResponse(responseText);
    setVoiceState('success');
    speak(responseText);
    logCommand(spoken, command.action, true, confidence);

    registerTimeout(() => setVoiceState('idle'), 3000);
  }, [pendingConfirmation, handlers, navigate, speak, logCommand, registerTimeout]);

  // Start listening for a single command
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({ title: 'Voice not supported', description: 'Your browser does not support voice recognition.', variant: 'destructive' });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = settings.language || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setVoiceState('listening');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Voice recognition error:', event.error);
      if (event.error === 'no-speech') {
        setVoiceState('idle');
      } else {
        setVoiceState('error');
        registerTimeout(() => setVoiceState('idle'), 2000);
      }
    };

    recognition.onend = () => {
      if (voiceState === 'listening') setVoiceState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate(50);
  }, [settings.language, processCommand, toast, voiceState]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState('idle');
  }, []);

  // Wake word listening (continuous background)
  const startWakeWordListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.language || 'en-US';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (containsWakeWord(transcript, settings.wake_word)) {
          recognition.stop();
          if (navigator.vibrate) navigator.vibrate(100);
          // Small delay then start command listening
          registerTimeout(() => startListening(), 300);
          return;
        }
      }
    };

    recognition.onerror = () => {
      // Restart after error
      registerTimeout(() => {
        if (settings.voice_enabled) startWakeWordListening();
      }, 1000);
    };

    recognition.onend = () => {
      // Restart if still enabled
      if (settings.voice_enabled) {
        registerTimeout(() => startWakeWordListening(), 500);
      }
    };

    wakeWordRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      // Already started
    }
  }, [settings.language, settings.wake_word, settings.voice_enabled, startListening, registerTimeout]);

  const stopWakeWordListening = useCallback(() => {
    wakeWordRecognitionRef.current?.stop();
    wakeWordRecognitionRef.current = null;
  }, []);

  // Enable voice for the first time
  const enableVoice = useCallback(async () => {
    const newSettings = { ...settings, voice_enabled: true };
    await saveSettings(newSettings);
    setShowSafetyDisclaimer(false);
    setShowTutorial(true);
  }, [settings, saveSettings]);

  const requestEnableVoice = useCallback(() => {
    setShowSafetyDisclaimer(true);
  }, []);

  const dismissTutorial = useCallback(() => {
    setShowTutorial(false);
    startWakeWordListening();
  }, [startWakeWordListening]);

  // Auto-start wake word listening when enabled
  useEffect(() => {
    if (settings.voice_enabled && user) {
      startWakeWordListening();
    }
    return () => stopWakeWordListening();
  }, [settings.voice_enabled, user]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearPendingTimeouts();
      recognitionRef.current?.stop();
      wakeWordRecognitionRef.current?.stop();
      ttsEngine.stop();
    };
  }, [clearPendingTimeouts]);

  const hasSpeechSupport = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  return {
    voiceState,
    lastTranscript,
    lastResponse,
    settings,
    drivingMode,
    showSafetyDisclaimer,
    showTutorial,
    hasSpeechSupport,
    pendingConfirmation: !!pendingConfirmation,
    startListening,
    stopListening,
    processCommand,
    saveSettings,
    enableVoice,
    requestEnableVoice,
    dismissTutorial,
    setShowSafetyDisclaimer,
    setDrivingMode,
    speak,
  };
}
