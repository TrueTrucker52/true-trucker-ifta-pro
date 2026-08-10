import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Wand2 } from 'lucide-react';
import { useAutoAcceptMatch } from '@/hooks/useAutoAcceptMatch';

/** Toggle + threshold for auto-accepting confident trip matches. */
export const AutoAcceptSettings = () => {
  const { settings, update } = useAutoAcceptMatch();

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Wand2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <Label htmlFor="auto-accept" className="text-sm font-medium">
              Auto-accept confident matches
            </Label>
            <p className="text-xs text-muted-foreground">
              Assign the suggested trip automatically and flag it so you can review or change it later.
            </p>
          </div>
        </div>
        <Switch
          id="auto-accept"
          checked={settings.enabled}
          onCheckedChange={(v) => update({ enabled: v })}
        />
      </div>

      {settings.enabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label htmlFor="auto-accept-threshold" className="text-xs text-muted-foreground">
              Confidence threshold
            </Label>
            <span className="font-medium tabular-nums">{settings.threshold}%</span>
          </div>
          <Slider
            id="auto-accept-threshold"
            min={55}
            max={100}
            step={5}
            value={[settings.threshold]}
            onValueChange={([v]) => update({ threshold: v })}
          />
          <p className="text-xs text-muted-foreground">
            Matches scoring {settings.threshold}% or higher are accepted without asking.
          </p>
        </div>
      )}
    </div>
  );
};
