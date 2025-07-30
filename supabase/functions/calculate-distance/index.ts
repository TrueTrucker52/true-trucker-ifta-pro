import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startLocation, endLocation } = await req.json();

    if (!startLocation || !endLocation) {
      return new Response(
        JSON.stringify({ error: 'Start and end locations are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'Mapbox configuration missing' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Calculating distance from "${startLocation}" to "${endLocation}"`);

    // Geocode start location
    const startGeoResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(startLocation)}.json?access_token=${mapboxToken}&limit=1`
    );
    
    if (!startGeoResponse.ok) {
      throw new Error(`Geocoding failed for start location: ${startGeoResponse.statusText}`);
    }
    
    const startGeoData = await startGeoResponse.json();
    
    if (!startGeoData.features || startGeoData.features.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not find start location' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Geocode end location
    const endGeoResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endLocation)}.json?access_token=${mapboxToken}&limit=1`
    );
    
    if (!endGeoResponse.ok) {
      throw new Error(`Geocoding failed for end location: ${endGeoResponse.statusText}`);
    }
    
    const endGeoData = await endGeoResponse.json();
    
    if (!endGeoData.features || endGeoData.features.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not find end location' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const startCoords = startGeoData.features[0].geometry.coordinates;
    const endCoords = endGeoData.features[0].geometry.coordinates;

    console.log(`Start coordinates: ${startCoords}`);
    console.log(`End coordinates: ${endCoords}`);

    // Get driving directions to calculate distance
    const directionsResponse = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?access_token=${mapboxToken}&geometries=geojson`
    );
    
    if (!directionsResponse.ok) {
      throw new Error(`Directions API failed: ${directionsResponse.statusText}`);
    }
    
    const directionsData = await directionsResponse.json();
    
    if (!directionsData.routes || directionsData.routes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not calculate route between locations' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Distance is in meters, convert to miles
    const distanceMeters = directionsData.routes[0].distance;
    const distanceMiles = Math.round((distanceMeters * 0.000621371) * 10) / 10; // Round to 1 decimal place

    console.log(`Calculated distance: ${distanceMiles} miles`);

    return new Response(
      JSON.stringify({ 
        distance: distanceMiles,
        startLocation: startGeoData.features[0].place_name,
        endLocation: endGeoData.features[0].place_name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error calculating distance:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to calculate distance' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});