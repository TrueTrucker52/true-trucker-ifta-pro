import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Check, X, Loader2 } from 'lucide-react';
import { VoiceState } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

interface VoiceCommandButtonProps {
  voiceState: VoiceState;
  voiceEnabled: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

const stateConfig: Record<VoiceState, { bg: string; icon: React.ReactNode; pulse: boolean }> = {
  idle: { bg: '#6b7280', icon: <Mic className="h-6 w-6 text-white" />, pulse: false },
  listening: { bg: '#ef4444', icon: <Mic className="h-6 w-6 text-white" />, pulse: true },
  processing: { bg: '#eab308', icon: <Loader2 className="h-6 w-6 text-white animate-spin" />, pulse: false },
  success: { bg: '#22c55e', icon: <Check className="h-6 w-6 text-white" />, pulse: false },
  error: { bg: '#ef4444', icon: <X className="h-6 w-6 text-white" />, pulse: false },
};

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({
  voiceState,
  voiceEnabled,
  onTap,
  onLongPress,
}) => {
  const isMobile = useIsMobile();
  const config = stateConfig[voiceState];
  const longPressRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    longPressRef.current = setTimeout(onLongPress, 500);
  };

  const handlePointerUp = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handleClick = () => {
    onTap();
  };

  if (!voiceEnabled && voiceState === 'idle') {
    // Show orange mic button to invite enabling
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed z-50"
        style={{ bottom: isMobile ? '80px' : '24px', left: '16px' }}
      >
        <button
          onClick={onTap}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#f97316' }}
          aria-label="Enable voice commands"
        >
          <MicOff className="h-5 w-5 text-white" />
        </button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed z-50"
        style={{ bottom: isMobile ? '80px' : '24px', left: '16px' }}
      >
        {/* Pulse ring for listening state */}
        {config.pulse && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: config.bg }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <button
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: config.bg }}
          aria-label={
            voiceState === 'listening' ? 'Stop listening' :
            voiceState === 'processing' ? 'Processing voice command' :
            'Tap to speak a command'
          }
        >
          {config.icon}
        </button>

        {/* State label */}
        {voiceState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-background border rounded-full px-3 py-1.5 text-xs font-medium shadow-md"
          >
            {voiceState === 'listening' && '🎤 Listening...'}
            {voiceState === 'processing' && '🔍 Processing...'}
            {voiceState === 'success' && '✅ Done!'}
            {voiceState === 'error' && '❌ Try again'}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCommandButton;
