import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, Fuel } from 'lucide-react';

const RouteMap = () => {
  const waypoints = [
    { id: 1, name: "Denver, CO", type: "origin", x: 25, y: 60 },
    { id: 2, name: "Kansas City, MO", type: "fuel", x: 45, y: 50 },
    { id: 3, name: "St. Louis, MO", type: "stop", x: 55, y: 45 },
    { id: 4, name: "Indianapolis, IN", type: "fuel", x: 65, y: 40 },
    { id: 5, name: "Columbus, OH", type: "stop", x: 75, y: 35 },
    { id: 6, name: "Philadelphia, PA", type: "destination", x: 85, y: 30 }
  ];

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'origin': return <MapPin className="h-4 w-4 text-success" />;
      case 'destination': return <Navigation className="h-4 w-4 text-destructive" />;
      case 'fuel': return <Fuel className="h-4 w-4 text-secondary" />;
      default: return <Truck className="h-4 w-4 text-primary" />;
    }
  };

  const getWaypointColor = (type: string) => {
    switch (type) {
      case 'origin': return 'bg-success border-success/20';
      case 'destination': return 'bg-destructive border-destructive/20';
      case 'fuel': return 'bg-secondary border-secondary/20';
      default: return 'bg-primary border-primary/20';
    }
  };

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-muted/50 to-background border rounded-xl overflow-hidden">
      {/* Background map pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* State boundaries mockup */}
          <path d="M20,20 L80,20 L80,80 L20,80 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <path d="M40,20 L40,80" stroke="currentColor" strokeWidth="0.3" fill="none" />
          <path d="M60,20 L60,80" stroke="currentColor" strokeWidth="0.3" fill="none" />
          <path d="M20,40 L80,40" stroke="currentColor" strokeWidth="0.3" fill="none" />
          <path d="M20,60 L80,60" stroke="currentColor" strokeWidth="0.3" fill="none" />
        </svg>
      </div>

      {/* Route line */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d={`M ${waypoints[0].x} ${waypoints[0].y} ${waypoints.slice(1).map(w => `L ${w.x} ${w.y}`).join(' ')}`}
          stroke="hsl(var(--primary))"
          strokeWidth="0.3"
          fill="none"
          strokeDasharray="2,1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </svg>

      {/* Waypoints */}
      {waypoints.map((waypoint, index) => (
        <motion.div
          key={waypoint.id}
          className={`absolute w-8 h-8 rounded-full border-2 ${getWaypointColor(waypoint.type)} flex items-center justify-center shadow-lg`}
          style={{ 
            left: `${waypoint.x}%`, 
            top: `${waypoint.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.2, y: -2 }}
        >
          {getWaypointIcon(waypoint.type)}
          
          {/* Tooltip */}
          <motion.div
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg px-2 py-1 text-xs font-medium shadow-lg opacity-0 pointer-events-none"
            whileHover={{ opacity: 1 }}
          >
            {waypoint.name}
          </motion.div>
        </motion.div>
      ))}

      {/* Animated truck */}
      <motion.div
        className="absolute w-6 h-6 text-primary z-10"
        animate={{
          x: [
            `${waypoints[0].x}%`,
            `${waypoints[1].x}%`,
            `${waypoints[2].x}%`,
            `${waypoints[3].x}%`,
            `${waypoints[4].x}%`,
            `${waypoints[5].x}%`
          ],
          y: [
            `${waypoints[0].y}%`,
            `${waypoints[1].y}%`,
            `${waypoints[2].y}%`,
            `${waypoints[3].y}%`,
            `${waypoints[4].y}%`,
            `${waypoints[5].y}%`
          ]
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 2
        }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <Truck className="w-6 h-6" />
      </motion.div>

      {/* Route Summary */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3">
        <div className="text-xs font-semibold text-foreground mb-1">Cross-Country Route</div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>Distance: 1,247 miles</div>
          <div>States: CO, KS, MO, IN, OH, PA</div>
          <div>Est. Fuel Tax: $289.32</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3">
        <div className="text-xs font-semibold text-foreground mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
            Origin
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
            Fuel Stop
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
            Rest Stop
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
            Destination
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;