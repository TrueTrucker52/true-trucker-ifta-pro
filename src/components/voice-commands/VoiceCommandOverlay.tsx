import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceState } from './types';

interface VoiceCommandOverlayProps {
  voiceState: VoiceState;
  transcript: string;
  response: string;
  pendingConfirmation: boolean;
  onClose: () => void;
}

const VoiceCommandOverlay: React.FC<VoiceCommandOverlayProps> = ({
  voiceState,
  transcript,
  response,
  pendingConfirmation,
  onClose,
}) => {
  const isVisible = voiceState === 'listening' || voiceState === 'processing' ||
    (voiceState === 'success' && response) || voiceState === 'error' || pendingConfirmation;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-28 left-4 right-4 md:left-auto md:right-auto md:bottom-24 md:left-4 md:w-96 z-50"
        >
          <div className="bg-background border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b">
              <div className="flex items-center gap-2">
                {voiceState === 'listening' && (
                  <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                )}
                {voiceState === 'processing' && (
                  <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                )}
                {voiceState === 'success' && (
                  <Volume2 className="h-4 w-4 text-green-600" />
                )}
                {voiceState === 'error' && (
                  <span className="text-red-500 text-sm">❌</span>
                )}
                <span className="text-xs font-medium text-foreground">
                  {voiceState === 'listening' && 'Listening...'}
                  {voiceState === 'processing' && 'Processing...'}
                  {voiceState === 'success' && 'TruckerAI'}
                  {voiceState === 'error' && 'Not understood'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* What was heard */}
              {transcript && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">You said:</p>
                  <p className="text-sm text-foreground">"{transcript}"</p>
                </div>
              )}

              {/* Listening animation */}
              {voiceState === 'listening' && !transcript && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex gap-1 items-end h-8">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-red-500 rounded-full"
                        animate={{ height: ['8px', '24px', '8px'] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Response */}
              {response && (voiceState === 'success' || voiceState === 'error') && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">
                    {voiceState === 'error' ? 'Try saying:' : 'Response:'}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{response}</p>
                </div>
              )}

              {/* Pending confirmation */}
              {pendingConfirmation && (
                <div className="flex gap-2 pt-1">
                  <p className="text-xs text-muted-foreground">Say <strong>YES</strong> or <strong>NO</strong>, or tap:</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceCommandOverlay;
