import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, Fuel } from 'lucide-react';

const RouteMap = () => {
  const waypoints = [
    { id: 1, name: "Denver, CO", type: "origin", x: 15, y: 70 },
    { id: 2, name: "Kansas City, MO", type: "fuel", x: 35, y: 60 },
    { id: 3, name: "St. Louis, MO", type: "stop", x: 45, y: 55 },
    { id: 4, name: "Indianapolis, IN", type: "fuel", x: 60, y: 50 },
    { id: 5, name: "Columbus, OH", type: "stop", x: 70, y: 45 },
    { id: 6, name: "Philadelphia, PA", type: "destination", x: 85, y: 40 }
  ];

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'origin': return <MapPin className="h-4 w-4 text-white" />;
      case 'destination': return <Navigation className="h-4 w-4 text-white" />;
      case 'fuel': return <Fuel className="h-4 w-4 text-white" />;
      default: return <Truck className="h-4 w-4 text-white" />;
    }
  };

  const getWaypointColor = (type: string) => {
    switch (type) {
      case 'origin': return 'bg-green-500 border-green-300';
      case 'destination': return 'bg-red-500 border-red-300';
      case 'fuel': return 'bg-orange-500 border-orange-300';
      default: return 'bg-blue-500 border-blue-300';
    }
  };

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 border rounded-xl overflow-hidden">
      {/* Realistic Map Background */}
      <div className="absolute inset-0">
        {/* States outlines */}
        <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Colorado */}
          <path d="M5,60 L25,60 L25,80 L5,80 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.2" />
          {/* Kansas */}
          <path d="M25,55 L40,55 L40,75 L25,75 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.2" />
          {/* Missouri */}
          <path d="M40,50 L55,50 L55,70 L40,70 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.2" />
          {/* Indiana */}
          <path d="M55,45 L65,45 L65,65 L55,65 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.2" />
          {/* Ohio */}
          <path d="M65,40 L75,40 L75,60 L65,60 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.2" />
          {/* Pennsylvania */}
          <path d="M75,35 L90,35 L90,55 L75,55 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="0.2" />
          
          {/* Interstate highways */}
          <path d="M15,70 Q35,60 45,55 Q60,50 70,45 Q75,42 85,40" stroke="#6b7280" strokeWidth="0.5" fill="none" strokeDasharray="1,0.5" />
        </svg>

        {/* Cities as small dots */}
        <div className="absolute top-1/2 left-[20%] w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="absolute top-[45%] left-[40%] w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="absolute top-[40%] left-[50%] w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="absolute top-[35%] left-[65%] w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="absolute top-[30%] left-[75%] w-1 h-1 bg-gray-400 rounded-full"></div>

        {/* Mountain ranges (Colorado) */}
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3">
          <svg className="w-full h-full opacity-30" viewBox="0 0 100 100">
            <path d="M0,70 L20,40 L40,50 L60,30 L80,45 L100,35 L100,100 L0,100 Z" fill="#9ca3af" />
          </svg>
        </div>
      </div>

      {/* Route line */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d={`M ${waypoints[0].x} ${waypoints[0].y} Q ${waypoints[1].x} ${waypoints[1].y} ${waypoints[2].x} ${waypoints[2].y} Q ${waypoints[3].x} ${waypoints[3].y} ${waypoints[4].x} ${waypoints[4].y} Q ${waypoints[5].x-5} ${waypoints[5].y} ${waypoints[5].x} ${waypoints[5].y}`}
          stroke="#0084ff"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="3,2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </svg>

      {/* Waypoints */}
      {waypoints.map((waypoint, index) => (
        <motion.div
          key={waypoint.id}
          className={`absolute w-10 h-10 rounded-full border-2 ${getWaypointColor(waypoint.type)} flex items-center justify-center shadow-lg`}
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
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 font-medium shadow-lg opacity-0 pointer-events-none whitespace-nowrap z-20"
            whileHover={{ opacity: 1 }}
          >
            {waypoint.name}
          </motion.div>
        </motion.div>
      ))}

      {/* Animated truck */}
      <motion.div
        className="absolute w-8 h-8 text-blue-600 z-10 filter drop-shadow-lg"
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
        <Truck className="w-8 h-8" />
      </motion.div>

      {/* Route Summary */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-1">Cross-Country Route</div>
        <div className="text-xs text-gray-600 space-y-0.5">
          <div>📍 Distance: 1,247 miles</div>
          <div>🗺️ States: CO, KS, MO, IN, OH, PA</div>
          <div>💰 Est. Fuel Tax: $289.32</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-2">Route Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2 flex items-center justify-center">
              <MapPin className="w-2 h-2 text-white" />
            </div>
            Origin
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2 flex items-center justify-center">
              <Fuel className="w-2 h-2 text-white" />
            </div>
            Fuel Stop
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
              <Truck className="w-2 h-2 text-white" />
            </div>
            Rest Stop
          </div>
          <div className="flex items-center text-xs">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2 flex items-center justify-center">
              <Navigation className="w-2 h-2 text-white" />
            </div>
            Destination
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;