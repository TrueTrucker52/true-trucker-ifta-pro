import { memo, useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// All IFTA member jurisdictions (48 US states + DC, excludes AK/HI)
const iftaStates = [
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

// Memoized state button to prevent unnecessary re-renders on mobile
const StateButton = memo(({ 
  state, 
  isSelected, 
  onToggle 
}: { 
  state: string; 
  isSelected: boolean; 
  onToggle: (state: string) => void;
}) => (
  <button
    className={`
      p-2 text-xs font-medium rounded border transition-colors
      min-h-[36px] min-w-[36px]
      ${isSelected 
        ? 'bg-primary text-primary-foreground border-primary' 
        : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
      }
    `}
    onClick={() => onToggle(state)}
    aria-pressed={isSelected}
    aria-label={`${state} - ${isSelected ? 'Selected' : 'Not selected'}`}
  >
    {state}
  </button>
));

StateButton.displayName = 'StateButton';

export const InteractiveStateMap = memo(() => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStateToggle = useCallback((state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedStates(iftaStates);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedStates([]);
  }, []);

  // Show 16 states collapsed, all when expanded - optimized for mobile
  const visibleStates = useMemo(() => 
    isExpanded ? iftaStates : iftaStates.slice(0, 16),
    [isExpanded]
  );

  return (
    <div className="bg-card p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">IFTA Member Jurisdictions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show All <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>
      
      {/* Optimized grid with memoized buttons */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-w-2xl mx-auto">
        {visibleStates.map((state) => (
          <StateButton
            key={state}
            state={state}
            isSelected={selectedStates.includes(state)}
            onToggle={handleStateToggle}
          />
        ))}
      </div>

      {!isExpanded && iftaStates.length > 16 && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          +{iftaStates.length - 16} more states available
        </p>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {selectedStates.length === 0 
            ? "Tap states to select your routes" 
            : `Selected: ${selectedStates.join(", ")}`
          }
        </p>
      </div>
      
      <div className="mt-4 flex justify-center gap-3">
        <Button
          size="sm"
          onClick={handleSelectAll}
        >
          Select All
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClearAll}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
});

InteractiveStateMap.displayName = 'InteractiveStateMap';
