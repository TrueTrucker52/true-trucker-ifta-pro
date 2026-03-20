import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EnrichedTruckLocation } from '@/hooks/useFleetLocations';
import { Geofence } from '@/hooks/useGeofences';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';

export interface FleetMapViewProps {
  trucks: EnrichedTruckLocation[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string) => void;
  geofences?: Geofence[];
  isAddingGeofence?: boolean;
  onMapClickForGeofence?: (lat: number, lng: number) => void;
  focusGeofence?: Geofence | null;
}

const FleetMapView = ({
  trucks,
  selectedTruckId,
  onSelectTruck,
  geofences = [],
  isAddingGeofence = false,
  onMapClickForGeofence,
  focusGeofence,
}: FleetMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const geofenceMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
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
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.on('load', () => setMapReady(true));
    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current.clear();
      popupsRef.current.clear();
      geofenceMarkersRef.current.forEach(m => m.remove());
      geofenceMarkersRef.current.clear();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [MAPBOX_TOKEN, mapStyle]);

  // Handle map click for geofence placement
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    const handler = (e: mapboxgl.MapMouseEvent) => {
      if (isAddingGeofence && onMapClickForGeofence) {
        onMapClickForGeofence(e.lngLat.lat, e.lngLat.lng);
      }
    };

    map.on('click', handler);
    // Change cursor when in add mode
    map.getCanvas().style.cursor = isAddingGeofence ? 'crosshair' : '';

    return () => {
      map.off('click', handler);
      map.getCanvas().style.cursor = '';
    };
  }, [isAddingGeofence, onMapClickForGeofence, mapReady]);

  // Render truck markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const currentIds = new Set(trucks.map(t => t.truck_id));

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
        const popup = popupsRef.current.get(truck.truck_id);
        if (popup) popup.setHTML(popupHTML(truck));
      } else {
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
        if (truck.is_moving) el.style.animation = 'pulse-green 2s infinite';

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

  // Render geofence circles
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;
    const currentIds = new Set(geofences.map(g => g.id));

    // Remove old
    geofenceMarkersRef.current.forEach((m, id) => {
      if (!currentIds.has(id)) {
        m.remove();
        geofenceMarkersRef.current.delete(id);
      }
    });

    geofences.forEach(gf => {
      // Remove existing to re-render (radius/color may change)
      const existing = geofenceMarkersRef.current.get(gf.id);
      if (existing) existing.remove();

      // Add/update source + layer for circle
      const sourceId = `geofence-${gf.id}`;
      const layerFillId = `geofence-fill-${gf.id}`;
      const layerLineId = `geofence-line-${gf.id}`;

      // Remove old layers/sources
      if (map.getLayer(layerFillId)) map.removeLayer(layerFillId);
      if (map.getLayer(layerLineId)) map.removeLayer(layerLineId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      // Create GeoJSON circle approximation
      const circle = createGeoJSONCircle([gf.longitude, gf.latitude], gf.radius_meters / 1000);

      map.addSource(sourceId, { type: 'geojson', data: circle });

      map.addLayer({
        id: layerFillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': gf.color,
          'fill-opacity': 0.15,
        },
      });

      map.addLayer({
        id: layerLineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': gf.color,
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      // Label marker at center
      const labelEl = document.createElement('div');
      labelEl.style.cssText = `
        background:${gf.color};color:#fff;font-size:10px;font-weight:700;
        padding:2px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;
        box-shadow:0 1px 4px rgba(0,0,0,.3);
      `;
      labelEl.textContent = gf.name;
      const labelMarker = new mapboxgl.Marker({ element: labelEl, anchor: 'center' })
        .setLngLat([gf.longitude, gf.latitude])
        .addTo(map);

      geofenceMarkersRef.current.set(gf.id, labelMarker);
    });

    // Cleanup on unmount
    return () => {
      geofences.forEach(gf => {
        const sourceId = `geofence-${gf.id}`;
        const layerFillId = `geofence-fill-${gf.id}`;
        const layerLineId = `geofence-line-${gf.id}`;
        if (map.getLayer(layerFillId)) map.removeLayer(layerFillId);
        if (map.getLayer(layerLineId)) map.removeLayer(layerLineId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
    };
  }, [geofences, mapReady]);

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

  // Fly to focused geofence
  useEffect(() => {
    if (!mapRef.current || !focusGeofence || !mapReady) return;
    const zoom = Math.max(12, 15 - Math.log2(focusGeofence.radius_meters / 100));
    mapRef.current.flyTo({
      center: [focusGeofence.longitude, focusGeofence.latitude],
      zoom,
      duration: 1000,
    });
  }, [focusGeofence, mapReady]);

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

      {/* Geofence add mode indicator */}
      {isAddingGeofence && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
          📍 Click on the map to place a geofence zone
        </div>
      )}

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

      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
          50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
};

// Helper: create GeoJSON circle polygon
function createGeoJSONCircle(center: [number, number], radiusKm: number, points = 64): GeoJSON.FeatureCollection {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // close ring

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [coords] },
      properties: {},
    }],
  };
}

function markerBgColor(t: EnrichedTruckLocation) {
  if (t.is_moving) return '#f97316';
  const mins = (Date.now() - new Date(t.recorded_at).getTime()) / 60000;
  if (mins < 5) return '#eab308';
  if (mins < 30) return '#ef4444';
  return '#9ca3af';
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
