
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

// Create embeddings for a piece of text
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

// Store knowledge with its embedding
async function storeKnowledge(
  supabase: any,
  content: string,
  sourceId: string,
  embedding: number[]
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("knowledge_vectors")
      .insert({
        content: content,
        source_id: sourceId,
        embedding: embedding,
      });
      
    if (error) {
      throw error;
    }
    
    console.log("Knowledge stored:", data);
  } catch (error) {
    console.error("Error storing knowledge:", error);
    throw error;
  }
}

// Create a context source entry
async function createContextSource(
  supabase: any,
  name: string,
  description: string,
  sourceType: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("context_sources")
      .insert({
        name: name,
        description: description,
        source_type: sourceType,
      })
      .select("id")
      .single();
      
    if (error) {
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error creating context source:", error);
    throw error;
  }
}

// Seed the database with logistics knowledge
async function seedLogisticsKnowledge(supabase: any): Promise<void> {
  // Sample logistics knowledge fragments
  const knowledgeFragments = [
    {
      content: "Crane Worldwide Logistics specializes in freight forwarding, customs brokerage, and supply chain solutions. We operate in over 30 countries with more than 120 locations worldwide, providing comprehensive logistics services tailored to client needs.",
      name: "Company Overview",
      description: "General overview of Crane Worldwide Logistics services and global presence",
      source_type: "company_info"
    },
    {
      content: "Our air freight services include expedited shipping, charter solutions, and consolidated freight options. Crane Worldwide manages over 100,000 air shipments annually with real-time tracking and optimization capabilities.",
      name: "Air Freight Services",
      description: "Details about Crane's air freight capabilities and solutions",
      source_type: "services"
    },
    // More knowledge fragments would be added in a real implementation
    {
      content: "Crane's customs brokerage services handle import clearance, duty management, free trade agreements, and compliance consulting. Our team includes certified customs specialists who ensure smooth border crossings and regulatory compliance across global markets.",
      name: "Customs Brokerage",
      description: "Information about Crane's customs clearance and compliance services",
      source_type: "services"
    },
    {
      content: "SmartClearance is Crane's advanced document processing system that uses AI to extract, validate, and process shipping documents. The system can identify issues in commercial invoices, bills of lading, certificates of origin, and other shipping documents with 94% validation accuracy.",
      name: "SmartClearance Technology",
      description: "Details about Crane's AI-powered document validation system",
      source_type: "technology"
    },
    {
      content: "For imports to the United States, all commercial shipments valued over $2,500 require a formal entry with complete documentation including commercial invoice, bill of lading, certificate of origin if claiming preferential treatment, and applicable permits or licenses depending on the commodity.",
      name: "US Import Requirements",
      description: "Standard documentation requirements for US imports",
      source_type: "compliance"
    }
  ];

  for (const item of knowledgeFragments) {
    try {
      // Create context source
      const sourceId = await createContextSource(
        supabase,
        item.name,
        item.description,
        item.source_type
      );
      
      // Create embedding
      const embedding = await createEmbedding(item.content);
      
      // Store knowledge with embedding
      await storeKnowledge(supabase, item.content, sourceId, embedding);
      
      console.log(`Added knowledge: ${item.name}`);
    } catch (error) {
      console.error(`Failed to add knowledge: ${item.name}`, error);
    }
  }
}

// Crawl website content and extract main text
async function crawlWebsite(url: string): Promise<string[]> {
  try {
    // In a real implementation, this would use a proper web crawler
    // Here we'll just simulate with some example content from major pages
    
    const websiteContent = [
      "Crane Worldwide Logistics provides comprehensive supply chain solutions across air, ocean, customs brokerage, logistics management, and specialized verticals including automotive, aerospace, energy, and retail.",
      "Our technology solutions include CraneTech, SmartClearance, CraneWMS, and BI dashboards that provide real-time visibility across your entire supply chain.",
      "Crane Worldwide has offices in North America, Europe, Asia, the Middle East, Africa, and Latin America, with headquarters in Houston, Texas.",
      "The SmartClearance engine uses advanced AI to process customs documentation with 87% data extraction accuracy and 94% validation rate, reducing clearance times by up to 40%."
    ];
    
    return websiteContent;
  } catch (error) {
    console.error("Error crawling website:", error);
    return [];
  }
}

// Process website content into the knowledge base
async function processWebsiteContent(supabase: any): Promise<void> {
  try {
    const websiteContent = await crawlWebsite("https://craneww.com");
    
    for (let i = 0; i < websiteContent.length; i++) {
      const content = websiteContent[i];
      
      // Create context source for website content
      const sourceId = await createContextSource(
        supabase,
        `Website Content ${i+1}`,
        `Extracted content from Crane Worldwide website`,
        "website_content"
      );
      
      // Create embedding
      const embedding = await createEmbedding(content);
      
      // Store knowledge with embedding
      await storeKnowledge(supabase, content, sourceId, embedding);
      
      console.log(`Added website content chunk ${i+1}`);
    }
  } catch (error) {
    console.error("Error processing website content:", error);
  }
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { includeWebsiteContent = false } = await req.json() || {};
    
    // Create tables if they don't exist
    await supabase.rpc("create_knowledge_base_tables").catch(err => {
      console.log("Tables might already exist or couldn't be created:", err);
    });
    
    // Seed with logistics knowledge
    await seedLogisticsKnowledge(supabase);
    
    // If enabled, also process website content
    if (includeWebsiteContent) {
      await processWebsiteContent(supabase);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Knowledge base seeded successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in seed function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
