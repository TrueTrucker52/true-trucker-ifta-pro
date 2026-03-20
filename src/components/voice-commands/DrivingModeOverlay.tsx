import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, X, Mic, Volume2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DrivingModeOverlayProps {
  isActive: boolean;
  lastResponse: string;
  voiceState: string;
  onExit: () => void;
  onMicTap: () => void;
}

const DrivingModeOverlay: React.FC<DrivingModeOverlayProps> = ({
  isActive,
  lastResponse,
  voiceState,
  onExit,
  onMicTap,
}) => {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/90 flex flex-col items-center justify-center p-6"
        >
          {/* Exit hint */}
          <div className="absolute top-6 right-6">
            <button
              onClick={onExit}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Exit driving mode"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="absolute top-6 left-6">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Moon className="h-4 w-4" />
              <span>Driving Mode</span>
            </div>
          </div>

          {/* Main mic button */}
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <p className="text-white/80 text-lg mb-1">🚛 TrueTrucker</p>
              <p className="text-white/50 text-sm">Say "Hey Trucker" or tap the mic</p>
            </div>

            <button
              onClick={onMicTap}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                voiceState === 'listening'
                  ? 'bg-red-500 animate-pulse'
                  : voiceState === 'processing'
                  ? 'bg-yellow-500'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              aria-label="Tap to speak"
            >
              {voiceState === 'listening' ? (
                <Mic className="h-12 w-12 text-white" />
              ) : voiceState === 'processing' ? (
                <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mic className="h-12 w-12 text-white/80" />
              )}
            </button>

            {/* Last response */}
            {lastResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-sm text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">TruckerAI</span>
                </div>
                <p className="text-white text-base leading-relaxed">{lastResponse}</p>
              </motion.div>
            )}
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-8 text-center">
            <p className="text-white/40 text-xs">
              Say "Driving mode off" or tap X to exit
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrivingModeOverlay;
