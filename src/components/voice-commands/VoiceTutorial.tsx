import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Navigation, MapPin, FileText, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceTutorialProps {
  isOpen: boolean;
  onDismiss: () => void;
  onTryNow: () => void;
}

const VoiceTutorial: React.FC<VoiceTutorialProps> = ({ isOpen, onDismiss, onTryNow }) => {
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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-background rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  🎤 Voice Commands Tutorial
                </h3>
                <button onClick={onDismiss} className="p-1 hover:bg-muted rounded-full">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Say these after <strong>"Hey Trucker"</strong> to control the app hands-free:
              </p>

              <div className="space-y-4">
                <TutorialSection
                  icon={<Navigation className="h-4 w-4" />}
                  title="🚛 Navigation"
                  commands={[
                    'Hey Trucker — Go to dashboard',
                    'Hey Trucker — Open my reports',
                  ]}
                />
                <TutorialSection
                  icon={<MapPin className="h-4 w-4" />}
                  title="📍 Trips"
                  commands={[
                    'Hey Trucker — Start a trip',
                    'Hey Trucker — End my trip',
                  ]}
                />
                <TutorialSection
                  icon={<FileText className="h-4 w-4" />}
                  title="📋 IFTA"
                  commands={[
                    'Hey Trucker — When is my IFTA due',
                    'Hey Trucker — How much do I owe',
                  ]}
                />
                <TutorialSection
                  icon={<MessageCircle className="h-4 w-4" />}
                  title="💬 Messages"
                  commands={[
                    'Hey Trucker — Read my messages',
                  ]}
                />
                <TutorialSection
                  icon={<HelpCircle className="h-4 w-4" />}
                  title="❓ Help"
                  commands={[
                    'Hey Trucker — Help',
                  ]}
                />
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  onClick={onTryNow}
                  className="w-full"
                  style={{ backgroundColor: '#f97316' }}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Try It Now 🎤
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDismiss}
                  className="w-full text-muted-foreground"
                >
                  Skip Tutorial
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function TutorialSection({ icon, title, commands }: { icon: React.ReactNode; title: string; commands: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {commands.map(cmd => (
        <p key={cmd} className="text-xs text-muted-foreground ml-6 mb-0.5">"{cmd}"</p>
      ))}
    </div>
  );
}

export default VoiceTutorial;
