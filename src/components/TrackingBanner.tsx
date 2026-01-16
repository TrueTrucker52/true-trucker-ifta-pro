import { useState, useEffect } from 'react';
import { MapPin, Radio, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrackingBannerProps {
  isTracking: boolean;
  currentState: string | null;
  totalMiles: number;
  statesCrossed: string[];
  startTime: Date | null;
  onStopTracking: () => void;
}

export const TrackingBanner = ({
  isTracking,
  currentState,
  totalMiles,
  statesCrossed,
  startTime,
  onStopTracking,
}: TrackingBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime || !isTracking) return;

    const updateTime = () => {
      const elapsed = Date.now() - startTime.getTime();
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime, isTracking]);

  if (!isTracking) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-success text-success-foreground shadow-lg">
      {/* Main banner */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Left side - Status indicator */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full animate-ping" />
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>Auto-Tracking Active</span>
                {currentState && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                    {currentState}
                  </span>
                )}
              </div>
              <p className="text-xs text-success-foreground/80 hidden sm:block">
                Location data is being collected for IFTA reporting
              </p>
            </div>
          </div>

          {/* Center - Stats (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalMiles.toFixed(1)}</p>
              <p className="text-xs text-success-foreground/80">Miles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono">{elapsedTime}</p>
              <p className="text-xs text-success-foreground/80">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statesCrossed.length}</p>
              <p className="text-xs text-success-foreground/80">States</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-success-foreground hover:bg-white/20 md:hidden"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onStopTracking}
              className="bg-white/20 hover:bg-white/30 text-success-foreground border-0"
            >
              <Square className="h-4 w-4 mr-2 fill-current" />
              Stop
            </Button>
          </div>
        </div>

        {/* Expanded mobile stats */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            isExpanded ? 'max-h-32 pb-3' : 'max-h-0'
          )}
        >
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/20">
            <div className="text-center">
              <p className="text-xl font-bold">{totalMiles.toFixed(1)}</p>
              <p className="text-xs text-success-foreground/80">Miles</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold font-mono">{elapsedTime}</p>
              <p className="text-xs text-success-foreground/80">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{statesCrossed.length}</p>
              <p className="text-xs text-success-foreground/80">States</p>
            </div>
          </div>
          {statesCrossed.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {statesCrossed.map(state => (
                <span
                  key={state}
                  className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium"
                >
                  {state}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingBanner;
