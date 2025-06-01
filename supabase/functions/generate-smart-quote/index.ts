
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteRequest {
  prompt: string;
  shipDate?: string;
  selectedModes?: string[];
}

interface QuoteOption {
  title: string;
  price: number;
  priceTrend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  validUntil: string;
  recommended?: boolean;
  transitTime?: string;
  reliability?: string;
}

interface QuoteResults {
  origin: string;
  destination: string;
  cargoType: string;
  quantity: string;
  modes: {
    ocean?: QuoteOption[];
    air?: QuoteOption[];
    multimodal?: QuoteOption[];
  };
  marketIntelligence: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, shipDate, selectedModes }: QuoteRequest = await req.json();

    console.log('Processing quote request:', { prompt, shipDate, selectedModes });

    const systemPrompt = `You are a freight forwarding AI that generates realistic shipping quotes based on natural language requests. 

Parse the user's shipping request and extract:
- Origin and destination
- Cargo type and quantity
- Preferred transport modes
- Any special requirements

Then generate realistic quotes for the requested transport modes with:
- Competitive pricing based on current market rates
- Price trends (up/down/stable with percentages)
- Transit times
- Reliability ratings
- Market intelligence insights

Return the response in JSON format matching this structure:
{
  "origin": "string",
  "destination": "string", 
  "cargoType": "string",
  "quantity": "string",
  "modes": {
    "ocean": [{"title": "Standard Service", "price": 3250, "priceTrend": "up", "trendPercentage": 5, "validUntil": "May 30, 2025", "transitTime": "25-30 days", "reliability": "95%"}],
    "air": [{"title": "Express Air", "price": 8500, "priceTrend": "stable", "validUntil": "May 28, 2025", "transitTime": "3-5 days", "reliability": "98%"}],
    "multimodal": [{"title": "Rail-Ocean", "price": 4200, "priceTrend": "down", "trendPercentage": 2, "validUntil": "June 2, 2025", "transitTime": "18-22 days", "reliability": "92%"}]
  },
  "marketIntelligence": "Current market insights and recommendations"
}

Generate 2-3 options per mode when applicable. Mark the best value option as recommended.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate shipping quotes for: ${prompt}. Ship date: ${shipDate || 'Not specified'}. Requested modes: ${selectedModes?.join(', ') || 'All modes'}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('AI generated content:', generatedContent);

    // Parse the JSON response from AI
    let quoteResults: QuoteResults;
    try {
      quoteResults = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback with default structure
      quoteResults = {
        origin: "Unknown",
        destination: "Unknown", 
        cargoType: "General Cargo",
        quantity: "Not specified",
        modes: {
          ocean: [
            {
              title: "Standard Service",
              price: 3250,
              priceTrend: "up",
              trendPercentage: 5,
              validUntil: "May 30, 2025",
              transitTime: "25-30 days",
              reliability: "95%"
            }
          ]
        },
        marketIntelligence: "Unable to generate detailed market intelligence at this time. Please try again with a more specific request."
      };
    }

    return new Response(JSON.stringify(quoteResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-smart-quote function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
