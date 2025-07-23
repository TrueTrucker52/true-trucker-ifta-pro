import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ocrText, extractedData } = await req.json();

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
            
            ${ocrText}
            
            Current extracted data for reference:
            ${JSON.stringify(extractedData, null, 2)}`
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});