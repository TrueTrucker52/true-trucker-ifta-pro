import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://tlvngzfoxpjdltbpmzaz.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const validateInput = (ocrText: string, extractedData: any) => {
  if (!ocrText || typeof ocrText !== 'string') {
    throw new Error('OCR text is required and must be a string');
  }
  if (ocrText.length > 10000) {
    throw new Error('OCR text is too long');
  }
  if (extractedData && typeof extractedData !== 'object') {
    throw new Error('Extracted data must be an object');
  }
  
  // Sanitize OCR text
  const sanitized = ocrText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .substring(0, 5000);
    
  return { sanitizedOcrText: sanitized, validatedExtractedData: extractedData };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { ocrText, extractedData } = await req.json();
    const { sanitizedOcrText, validatedExtractedData } = validateInput(ocrText, extractedData);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting structured data from fuel receipt OCR text. 
            Return only a valid JSON object with these exact fields:
            {
              "date": "YYYY-MM-DD format",
              "time": "HH:MM format (24-hour)",
              "vendor": "Station brand name",
              "location": "City, State or full address",
              "gallons": "Number as string",
              "pricePerGallon": "Number as string",
              "totalAmount": "Number as string",
              "fuelTax": "Number as string (if found)",
              "stateCode": "2-letter state code"
            }
            If a field cannot be determined, use empty string. Be very accurate with numbers.`
          },
          {
            role: 'user',
            content: `Extract data from this fuel receipt OCR text:
            
            ${sanitizedOcrText}
            
            Current extracted data for reference:
            ${JSON.stringify(validatedExtractedData, null, 2)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const enhancedDataText = data.choices[0].message.content;
    
    // Parse the JSON response
    let enhancedData;
    try {
      enhancedData = JSON.parse(enhancedDataText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', enhancedDataText);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(JSON.stringify({ enhancedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-receipt-data function:', error);
    return new Response(JSON.stringify({ error: 'Failed to enhance receipt data' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});