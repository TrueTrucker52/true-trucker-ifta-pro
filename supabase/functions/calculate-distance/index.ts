import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const allowedOrigins = [
  'https://true-trucker-ifta-pro.lovable.app',
  'https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app',
  'https://tlvngzfoxpjdltbpmzaz.supabase.co',
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

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

    console.log(`Calculating distance from "${startLocation}" to "${endLocation}" for user ${userId}`);

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
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: 'Failed to calculate distance' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
