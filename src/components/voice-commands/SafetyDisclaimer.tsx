import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SafetyDisclaimerProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ isOpen, onAccept, onDecline }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">⚠️ Safety First</h3>
              <div className="text-sm text-muted-foreground space-y-2 text-left mb-6">
                <p>TrueTrucker voice commands are designed for hands-free use but:</p>
                <ul className="space-y-1.5 ml-1">
                  <li>• Always prioritize safe driving</li>
                  <li>• Never look at your phone while driving</li>
                  <li>• Pull over safely for complex tasks</li>
                  <li>• Voice commands work best at stops</li>
                  <li>• Use driving mode for long hauls</li>
                </ul>
                <p className="pt-2 text-xs">By enabling voice commands you agree to use them responsibly.</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={onAccept}
                  className="w-full"
                  style={{ backgroundColor: '#f97316' }}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  I Understand — Enable Voice 🎤
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDecline}
                  className="w-full text-muted-foreground"
                >
                  Not Right Now
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SafetyDisclaimer;
