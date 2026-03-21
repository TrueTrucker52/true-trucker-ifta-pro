import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceCommands } from './useVoiceCommands';
import VoiceCommandButton from './VoiceCommandButton';
import VoiceCommandOverlay from './VoiceCommandOverlay';
import SafetyDisclaimer from './SafetyDisclaimer';
import VoiceTutorial from './VoiceTutorial';
import DrivingModeOverlay from './DrivingModeOverlay';
import VoiceSettingsPanel from './VoiceSettingsPanel';

const VoiceCommandSystem: React.FC = () => {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const tryNowTimeoutRef = useRef<number | null>(null);

  const {
    voiceState,
    lastTranscript,
    lastResponse,
    settings,
    drivingMode,
    showSafetyDisclaimer,
    showTutorial,
    hasSpeechSupport,
    pendingConfirmation,
    startListening,
    stopListening,
    saveSettings,
    enableVoice,
    requestEnableVoice,
    dismissTutorial,
    setShowSafetyDisclaimer,
    setDrivingMode,
    speak,
  } = useVoiceCommands();

  useEffect(() => {
    return () => {
      if (tryNowTimeoutRef.current) {
        window.clearTimeout(tryNowTimeoutRef.current);
      }
    };
  }, []);

  if (!user || !hasSpeechSupport) return null;

  const handleButtonTap = () => {
    if (!settings.voice_enabled) {
      requestEnableVoice();
      return;
    }
    if (voiceState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleButtonLongPress = () => {
    if (settings.voice_enabled) {
      setShowSettings(true);
    }
  };

  const handleTestVoice = () => {
    speak("Hey there! I'm TruckerAI, your IFTA assistant. Voice commands are working great!");
  };

  const handleTryNow = () => {
    dismissTutorial();
    if (tryNowTimeoutRef.current) {
      window.clearTimeout(tryNowTimeoutRef.current);
    }

    tryNowTimeoutRef.current = window.setTimeout(() => {
      tryNowTimeoutRef.current = null;
      startListening();
    }, 300);
  };

  return (
    <>
      {/* Floating mic button (bottom left) */}
      <VoiceCommandButton
        voiceState={voiceState}
        voiceEnabled={settings.voice_enabled}
        onTap={handleButtonTap}
        onLongPress={handleButtonLongPress}
      />

      {/* Voice feedback overlay */}
      <VoiceCommandOverlay
        voiceState={voiceState}
        transcript={lastTranscript}
        response={lastResponse}
        pendingConfirmation={pendingConfirmation}
        onClose={stopListening}
      />

      {/* Safety disclaimer (first enable) */}
      <SafetyDisclaimer
        isOpen={showSafetyDisclaimer}
        onAccept={enableVoice}
        onDecline={() => setShowSafetyDisclaimer(false)}
      />

      {/* Tutorial */}
      <VoiceTutorial
        isOpen={showTutorial}
        onDismiss={dismissTutorial}
        onTryNow={handleTryNow}
      />

      {/* Driving mode */}
      <DrivingModeOverlay
        isActive={drivingMode}
        lastResponse={lastResponse}
        voiceState={voiceState}
        onExit={() => setDrivingMode(false)}
        onMicTap={handleButtonTap}
      />

      {/* Settings panel */}
      <VoiceSettingsPanel
        settings={settings}
        onSave={saveSettings}
        onTestVoice={handleTestVoice}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default VoiceCommandSystem;
