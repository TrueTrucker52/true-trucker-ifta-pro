import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, Fuel } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const RouteMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Route coordinates (Denver to Philadelphia)
  const routeCoordinates = [
    [-104.9903, 39.7392], // Denver, CO
    [-94.5786, 39.0997],  // Kansas City, MO
    [-90.1994, 38.6270],  // St. Louis, MO
    [-86.1581, 39.7684],  // Indianapolis, IN
    [-82.9988, 39.9612],  // Columbus, OH
    [-75.1652, 39.9526]   // Philadelphia, PA
  ];

  const waypoints = [
    { name: "Denver, CO", type: "origin", coords: [-104.9903, 39.7392] },
    { name: "Kansas City, MO", type: "fuel", coords: [-94.5786, 39.0997] },
    { name: "St. Louis, MO", type: "stop", coords: [-90.1994, 38.6270] },
    { name: "Indianapolis, IN", type: "fuel", coords: [-86.1581, 39.7684] },
    { name: "Columbus, OH", type: "stop", coords: [-82.9988, 39.9612] },
    { name: "Philadelphia, PA", type: "destination", coords: [-75.1652, 39.9526] }
  ];

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-90, 39.5],
      zoom: 4.5
    });

    map.current.on('load', () => {
      // Add route line
      map.current?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      map.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0084ff',
          'line-width': 4,
          'line-dasharray': [2, 2]
        }
      });

      // Add waypoint markers
      waypoints.forEach((waypoint, index) => {
        const el = document.createElement('div');
        el.className = `w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${
          waypoint.type === 'origin' ? 'bg-green-500 border-green-300' :
          waypoint.type === 'destination' ? 'bg-red-500 border-red-300' :
          waypoint.type === 'fuel' ? 'bg-orange-500 border-orange-300' :
          'bg-blue-500 border-blue-300'
        }`;
        
        const icon = document.createElement('div');
        icon.innerHTML = waypoint.type === 'origin' ? '📍' : 
                        waypoint.type === 'destination' ? '🎯' : 
                        waypoint.type === 'fuel' ? '⛽' : '🚛';
        icon.className = 'text-white text-sm';
        el.appendChild(icon);

        new mapboxgl.Marker(el)
          .setLngLat(waypoint.coords as [number, number])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${waypoint.name}</strong>`))
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <div className="relative w-full h-80 bg-gradient-to-br from-muted/50 to-background border rounded-xl flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-4">Enter Mapbox Token</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get your free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <input
              type="text"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbG..."
              className="w-full p-2 border rounded-lg bg-background"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Load Map
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 bg-gradient-to-br from-muted/50 to-background border rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 rounded-xl" />
      
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
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            Origin
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            Fuel Stop
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            Rest Stop
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            Destination
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;