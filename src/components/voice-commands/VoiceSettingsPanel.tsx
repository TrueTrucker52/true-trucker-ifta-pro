import React from 'react';
import { Mic, Volume2, Gauge, Globe, MessageCircle, MapPin, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { VoiceSettings } from './types';

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  onSave: (settings: VoiceSettings) => void;
  onTestVoice: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  settings,
  onSave,
  onTestVoice,
  isOpen,
  onClose,
}) => {
  const [local, setLocal] = React.useState<VoiceSettings>(settings);

  React.useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const update = (key: keyof VoiceSettings, value: any) => {
    setLocal(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">⚙️ Voice Command Settings</h3>
              <p className="text-xs text-muted-foreground">Customize your hands-free experience</p>
            </div>
          </div>

          {/* Wake Word */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Wake Word</label>
            <div className="space-y-2">
              {['hey trucker', 'hey true trucker'].map(word => (
                <label key={word} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="wakeWord"
                    checked={local.wake_word === word}
                    onChange={() => update('wake_word', word)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground capitalize">{word}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Voice Speed */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Voice Speed
            </label>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.1"
              value={local.voice_speed}
              onChange={e => update('voice_speed', parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Voice Volume */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Volume2 className="h-4 w-4" /> Voice Volume — {Math.round(local.voice_volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={local.voice_volume}
              onChange={e => update('voice_volume', parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Voice Gender */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Voice Gender</label>
            <div className="flex gap-4">
              {(['female', 'male'] as const).map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={local.voice_gender === g}
                    onChange={() => update('voice_gender', g)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground capitalize">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" /> Language
            </label>
            <select
              value={local.language}
              onChange={e => update('language', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="en-US">English (US)</option>
              <option value="es-US">Spanish (US)</option>
            </select>
          </div>

          {/* Auto Features */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Auto Features</label>

            <ToggleRow
              icon={<MessageCircle className="h-4 w-4" />}
              label="Read new messages aloud"
              checked={local.read_messages_aloud}
              onChange={v => update('read_messages_aloud', v)}
            />
            <ToggleRow
              icon={<MapPin className="h-4 w-4" />}
              label="Announce state crossings"
              checked={local.announce_state_crossings}
              onChange={v => update('announce_state_crossings', v)}
            />
            <ToggleRow
              icon={<Fuel className="h-4 w-4" />}
              label="Fuel stop reminders"
              checked={local.fuel_stop_reminders}
              onChange={v => update('fuel_stop_reminders', v)}
            />
          </div>

          {/* Driving Mode */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Driving Mode</label>
            <ToggleRow
              icon={<Mic className="h-4 w-4" />}
              label="Auto-enable when trip starts"
              checked={local.auto_driving_mode}
              onChange={v => update('auto_driving_mode', v)}
            />
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={onTestVoice}
              variant="outline"
              className="w-full"
            >
              <Mic className="h-4 w-4 mr-2" />
              Test Voice Settings 🎤
            </Button>
            <Button
              onClick={handleSave}
              className="w-full"
              style={{ backgroundColor: '#f97316' }}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default VoiceSettingsPanel;
