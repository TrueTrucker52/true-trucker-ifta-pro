import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * PRIVACY-CONSCIOUS RECEIPT DATA ENHANCEMENT
 * 
 * This edge function processes fuel receipt OCR text using OpenAI.
 * 
 * IMPORTANT: Only receipt-specific data is sent to OpenAI:
 * - Raw OCR text from the receipt image (dates, amounts, vendor names, locations)
 * - Pre-extracted receipt fields (gallons, prices, etc.)
 * 
 * NO Personal Identifiable Information (PII) is sent:
 * - User ID is only used for authentication, never sent to AI
 * - User email, name, or account details are never included
 * - No tracking or user-specific metadata is transmitted
 */

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://tlvngzfoxpjdltbpmzaz.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

/**
 * Strips any potential PII patterns from OCR text before AI processing.
 * This ensures no personal information is inadvertently sent to OpenAI.
 */
const stripPotentialPII = (text: string): string => {
  let cleaned = text;
  
  // Remove potential email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  
  // Remove potential phone numbers (various formats)
  cleaned = cleaned.replace(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');
  
  // Remove potential credit card numbers (basic patterns)
  cleaned = cleaned.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]');
  
  // Remove potential SSN patterns
  cleaned = cleaned.replace(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, '[SSN_REDACTED]');
  
  // Remove loyalty card member names that might appear (common patterns)
  cleaned = cleaned.replace(/(?:member|customer|name|cardholder)[:\s]+[A-Z][a-z]+\s+[A-Z][a-z]+/gi, '[NAME_REDACTED]');
  
  return cleaned;
};

/**
 * Validates and sanitizes input data before processing.
 * Ensures only receipt-relevant data is processed.
 */
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
  
  // Sanitize OCR text - remove scripts and limit length
  let sanitized = ocrText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .substring(0, 5000);
  
  // Strip potential PII before sending to AI
  sanitized = stripPotentialPII(sanitized);
  
  // Filter extractedData to only include receipt-specific fields
  const allowedFields = ['date', 'time', 'vendor', 'location', 'gallons', 'pricePerGallon', 'totalAmount', 'fuelTax', 'stateCode'];
  const filteredExtractedData: Record<string, any> = {};
  
  if (extractedData) {
    for (const field of allowedFields) {
      if (extractedData[field] !== undefined) {
        // Sanitize string values
        if (typeof extractedData[field] === 'string') {
          filteredExtractedData[field] = stripPotentialPII(extractedData[field]);
        } else {
          filteredExtractedData[field] = extractedData[field];
        }
      }
    }
  }
    
  return { sanitizedOcrText: sanitized, validatedExtractedData: filteredExtractedData };
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

    // NOTE: User ID is only used for authentication above.
    // No user-identifiable information is sent to OpenAI below.

    const { ocrText, extractedData } = await req.json();
    const { sanitizedOcrText, validatedExtractedData } = validateInput(ocrText, extractedData);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // PRIVACY: Only sanitized receipt text and filtered receipt fields are sent to OpenAI
    // No user ID, email, name, or any PII is included in this request
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
            If a field cannot be determined, use empty string. Be very accurate with numbers.
            Do NOT include any personal information like names, emails, or phone numbers in your response.`
          },
          {
            role: 'user',
            content: `Extract fuel receipt data from this OCR text:
            
            ${sanitizedOcrText}
            
            Pre-extracted data for reference:
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

    // Final sanitization of AI response to ensure no PII in output
    const sanitizedResponse: Record<string, string> = {};
    const allowedOutputFields = ['date', 'time', 'vendor', 'location', 'gallons', 'pricePerGallon', 'totalAmount', 'fuelTax', 'stateCode'];
    
    for (const field of allowedOutputFields) {
      if (enhancedData[field] !== undefined) {
        sanitizedResponse[field] = typeof enhancedData[field] === 'string' 
          ? stripPotentialPII(enhancedData[field])
          : String(enhancedData[field] || '');
      }
    }

    return new Response(JSON.stringify({ enhancedData: sanitizedResponse }), {
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