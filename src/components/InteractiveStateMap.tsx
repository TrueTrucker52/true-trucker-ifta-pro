import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const iftaStates = [
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export const InteractiveStateMap = () => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleStates, setVisibleStates] = useState(24); // Start with 24 states

  const handleStateClick = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  // Show more states when user scrolls or clicks "show more"
  const handleShowMore = () => {
    setVisibleStates(prev => Math.min(prev + 25, iftaStates.length));
  };

  // Memoize rendered states to avoid unnecessary re-renders
  const renderedStates = useMemo(() => {
    const statesToShow = isExpanded ? iftaStates.slice(0, visibleStates) : iftaStates.slice(0, 16);
    
    return statesToShow.map((state) => (
      <button
        key={state}
        className={`
          p-2 text-xs font-medium rounded border transition-colors
          ${selectedStates.includes(state) 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
          }
        `}
        onMouseEnter={() => setHoveredState(state)}
        onMouseLeave={() => setHoveredState(null)}
        onClick={() => handleStateClick(state)}
      >
        {state}
      </button>
    ));
  }, [selectedStates, isExpanded, visibleStates]);

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
            <>Show All States <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-8 gap-2 max-w-2xl mx-auto">
        {renderedStates}
      </div>

      {isExpanded && visibleStates < iftaStates.length && (
        <div className="text-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowMore}
          >
            Show More States ({iftaStates.length - visibleStates} remaining)
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {selectedStates.length === 0 
            ? "Click states to select your routes" 
            : `Selected: ${selectedStates.join(", ")}`
          }
        </p>
        {hoveredState && (
          <p className="text-sm text-primary font-medium mt-1">
            Hovering: {hoveredState}
          </p>
        )}
      </div>
      
      <div className="mt-4 flex justify-center space-x-4">
        <Button
          size="sm"
          onClick={() => setSelectedStates(iftaStates)}
          className="px-4 py-2"
        >
          Select All
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedStates([])}
          className="px-4 py-2"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};