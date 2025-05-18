
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create embeddings for text using OpenAI
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

// Fetch relevant context based on query
async function fetchRelevantContext(
  supabase: any, 
  query: string, 
  contextTypes: string[] = [], 
  limit: number = 5
): Promise<string> {
  try {
    // Get embedding for the query
    const queryEmbedding = await createEmbedding(query);
    
    // Construct the query to find relevant context
    let contextQuery = supabase
      .from("knowledge_vectors")
      .select(`
        id,
        content,
        context_sources(name, description, source_type)
      `)
      .limit(limit);
    
    // Filter by context type if provided
    if (contextTypes.length > 0) {
      contextQuery = contextQuery.in('context_sources.source_type', contextTypes);
    }
    
    const { data: contexts, error } = await contextQuery;
    
    if (error) {
      throw error;
    }
    
    if (!contexts || contexts.length === 0) {
      return "No relevant context available.";
    }
    
    // For now, just return all contexts
    // In a real implementation, we'd use vector similarity search using pgvector
    return contexts.map((c: any) => c.content).join("\n\n");
  } catch (error) {
    console.error("Error fetching relevant context:", error);
    return "Error retrieving context information.";
  }
}

// Process a query using the Model Context Protocol
async function processWithMCP(supabase: any, query: string, contextTypes: string[] = []): Promise<string> {
  try {
    // Step 1: Context Fetching - Retrieve relevant context
    const relevantContext = await fetchRelevantContext(supabase, query, contextTypes);
    
    // Step 2: Context Injection - Merge context with the prompt
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for Crane Worldwide Logistics, a global provider of customized logistics solutions with expertise in freight forwarding, customs brokerage, supply chain solutions, and specialized logistics services.

Your answers should be accurate, helpful, and grounded in Crane's logistics domain knowledge. Use the provided context information to inform your responses, but integrate it naturally.

CONTEXT INFORMATION:
${relevantContext}

When you don't know something or the context doesn't provide enough information, acknowledge the limitations of your knowledge rather than making up information. If appropriate, suggest contacting a Crane representative for more detailed assistance.`
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in MCP:", error);
    return `Sorry, I encountered an error processing your request: ${error.message}`;
  }
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { query, contextTypes = [] } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const response = await processWithMCP(supabase, query, contextTypes);
    
    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
