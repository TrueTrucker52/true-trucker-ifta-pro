import { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EnrichedTruckLocation } from '@/hooks/useFleetLocations';

// Use a public Mapbox token – publishable keys are fine in client code
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

interface FleetMapViewProps {
  trucks: EnrichedTruckLocation[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string) => void;
}

const FleetMapView = ({ trucks, selectedTruckId, onSelectTruck }: FleetMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle === 'streets'
        ? 'mapbox://styles/mapbox/streets-v12'
        : 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('load', () => setMapReady(true));
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current.clear();
      popupsRef.current.clear();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [MAPBOX_TOKEN, mapStyle]);

  // Update markers when trucks change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const currentIds = new Set(trucks.map(t => t.truck_id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        popupsRef.current.delete(id);
      }
    });

    trucks.forEach(truck => {
      const existing = markersRef.current.get(truck.truck_id);
      const lngLat: [number, number] = [truck.longitude, truck.latitude];

      if (existing) {
        existing.setLngLat(lngLat);
        // Update popup content
        const popup = popupsRef.current.get(truck.truck_id);
        if (popup) popup.setHTML(popupHTML(truck));
      } else {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'fleet-truck-marker';
        el.style.cssText = `
          width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:700;color:#fff;cursor:pointer;
          border:3px solid ${markerBorderColor(truck)};
          background:${markerBgColor(truck)};
          box-shadow:0 2px 8px rgba(0,0,0,.3);
          transition:transform .2s;
        `;
        el.textContent = `#${truck.truckNumber?.slice(0, 3) || '?'}`;
        el.title = `Truck #${truck.truckNumber} — ${truck.driverName}`;

        // Pulsing animation for moving trucks
        if (truck.is_moving) {
          el.style.animation = 'pulse-green 2s infinite';
        }

        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '260px' }).setHTML(popupHTML(truck));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(mapRef.current!);

        el.addEventListener('click', () => onSelectTruck(truck.truck_id));

        markersRef.current.set(truck.truck_id, marker);
        popupsRef.current.set(truck.truck_id, popup);
      }
    });
  }, [trucks, mapReady, onSelectTruck]);

  // Fly to selected truck
  useEffect(() => {
    if (!mapRef.current || !selectedTruckId || !mapReady) return;
    const truck = trucks.find(t => t.truck_id === selectedTruckId);
    if (truck) {
      mapRef.current.flyTo({ center: [truck.longitude, truck.latitude], zoom: 12, duration: 1200 });
      const marker = markersRef.current.get(selectedTruckId);
      if (marker) marker.togglePopup();
    }
  }, [selectedTruckId, mapReady, trucks]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 text-muted-foreground text-center p-8">
        <div>
          <p className="text-lg font-semibold mb-2">Mapbox API Key Required</p>
          <p className="text-sm">Add <code className="bg-muted px-1 rounded">VITE_MAPBOX_PUBLIC_TOKEN</code> to your environment variables to enable the live map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map style toggle */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-1 bg-background/90 backdrop-blur rounded-lg p-1 shadow border">
        <button
          onClick={() => setMapStyle('streets')}
          className={`px-3 py-1.5 text-xs rounded font-medium transition ${mapStyle === 'streets' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        >
          Streets
        </button>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-3 py-1.5 text-xs rounded font-medium transition ${mapStyle === 'satellite' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        >
          Satellite
        </button>
      </div>

      {/* Inject CSS animation */}
      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
          50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
};

function markerBgColor(t: EnrichedTruckLocation) {
  if (t.is_moving) return '#f97316'; // orange
  const mins = (Date.now() - new Date(t.recorded_at).getTime()) / 60000;
  if (mins < 5) return '#eab308'; // yellow
  if (mins < 30) return '#ef4444'; // red
  return '#9ca3af'; // gray
}

function markerBorderColor(t: EnrichedTruckLocation) {
  if (t.is_moving) return '#22c55e';
  const mins = (Date.now() - new Date(t.recorded_at).getTime()) / 60000;
  if (mins < 5) return '#facc15';
  if (mins < 30) return '#f87171';
  return '#6b7280';
}

function popupHTML(t: EnrichedTruckLocation) {
  const statusLabel = t.is_moving ? '🟢 Moving' : ((Date.now() - new Date(t.recorded_at).getTime()) / 60000 < 5 ? '🟡 Idling' : '🔴 Stopped');
  return `
    <div style="font-family:system-ui;font-size:13px;line-height:1.5">
      <strong>🚛 Truck #${t.truckNumber}</strong><br/>
      <span style="color:#666">Driver: ${t.driverName}</span><br/>
      <span>${statusLabel} · ${Math.round(t.speed)} mph</span><br/>
      ${t.address ? `<span style="color:#666">📍 ${t.address}</span><br/>` : ''}
      ${t.state_code ? `State: ${t.state_code}<br/>` : ''}
      ${t.battery_level != null ? `🔋 ${t.battery_level}%<br/>` : ''}
    </div>
  `;
}

export default FleetMapView;
