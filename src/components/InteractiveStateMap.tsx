import { motion } from "framer-motion";
import { useState } from "react";

const iftaStates = [
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export const InteractiveStateMap = () => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const handleStateClick = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  return (
    <div className="bg-card p-6 rounded-lg border">
      <h3 className="text-xl font-bold mb-4 text-center">IFTA Member Jurisdictions</h3>
      
      <div className="grid grid-cols-8 gap-2 max-w-2xl mx-auto">
        {iftaStates.map((state) => (
          <motion.button
            key={state}
            className={`
              p-2 text-xs font-medium rounded border transition-colors
              ${selectedStates.includes(state) 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
              }
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredState(state)}
            onHoverEnd={() => setHoveredState(null)}
            onClick={() => handleStateClick(state)}
          >
            {state}
          </motion.button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {selectedStates.length === 0 
            ? "Click states to select your routes" 
            : `Selected: ${selectedStates.join(", ")}`
          }
        </p>
        {hoveredState && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-primary font-medium mt-1"
          >
            Hovering: {hoveredState}
          </motion.p>
        )}
      </div>
      
      <div className="mt-4 flex justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedStates(iftaStates)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          Select All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedStates([])}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm"
        >
          Clear All
        </motion.button>
      </div>
    </div>
  );
};