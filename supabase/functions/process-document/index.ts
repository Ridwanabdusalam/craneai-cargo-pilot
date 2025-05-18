
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

// Helper function to clean OpenAI response from markdown formatting
function cleanJsonResponse(text) {
  // Remove markdown code blocks if present
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*$/g, "");
  
  // Also handle cases where there's no explicit json tag but still has backticks
  cleaned = cleaned.replace(/```\s*/g, "");
  
  // Trim any whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Helper to extract text from a PDF document using OpenAI
async function extractDocumentContent(fileUrl: string, documentType: string) {
  console.log("Extracting document content from:", fileUrl);
  
  try {
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
            content: `You are a highly accurate document parsing specialist that extracts structured information from logistics documents. 
            Extract all relevant fields and values from the provided document URL. 
            Format your response as a valid JSON object with fields organized by category. 
            DO NOT include markdown formatting or code blocks in your response, return ONLY raw JSON.
            For documents like commercial invoices, extract invoice number, dates, company details, amounts, line items.
            For bills of lading, extract vessel details, container numbers, ports, cargo descriptions.
            For certificates, extract certificate numbers, issuers, validity periods, standards referenced.`
          },
          {
            role: "user",
            content: `Extract all relevant information from this ${documentType}. The document is located at ${fileUrl}. Respond with structured JSON only.`
          }
        ],
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const data = await response.json();
    let extractedContent = data.choices[0].message.content;
    
    // Clean the response from any markdown formatting
    extractedContent = cleanJsonResponse(extractedContent);
    
    // Parse the extracted content as JSON
    try {
      return JSON.parse(extractedContent);
    } catch (parseError) {
      console.error("Failed to parse extracted content as JSON:", parseError);
      console.log("Raw content:", extractedContent);
      
      // If URL access is restricted, return a placeholder with an error message
      return { 
        error: "Document parsing not possible due to URL restrictions, please provide the file content for accurate extraction.",
        raw_text: extractedContent
      };
    }
  } catch (error) {
    console.error("Error extracting document content:", error);
    return { error: "Failed to extract document content" };
  }
}

// Validate the document using AI
async function validateDocument(content: any, documentType: string) {
  console.log("Validating document:", documentType);
  
  try {
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
            content: `You are a logistics document validation expert. Validate the provided document content against industry standards and requirements.
            Check for:
            1. Missing required fields
            2. Invalid data formats
            3. Inconsistencies between related fields
            4. Compliance issues with international shipping regulations
            
            Return ONLY a JSON array of validation issues. Each issue should have these properties:
            - field: The specific field with the issue
            - issue: Description of the problem
            - severity: Either "low", "medium", or "high"
            
            If no issues are found, return an empty array. DO NOT include markdown formatting in your response.`
          },
          {
            role: "user",
            content: `Validate this ${documentType} content:\n${JSON.stringify(content)}`
          }
        ],
        max_tokens: 1000,
      }),
    });
    
    const data = await response.json();
    let validationResult = data.choices[0].message.content;
    
    // Clean the response from any markdown formatting
    validationResult = cleanJsonResponse(validationResult);
    
    try {
      const issues = JSON.parse(validationResult);
      return Array.isArray(issues) ? issues : [];
    } catch (parseError) {
      console.error("Failed to parse validation result as JSON:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error validating document:", error);
    return [];
  }
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { documentId } = await req.json();
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "Document ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update document status to processing
    await supabase
      .from("documents")
      .update({ status: "processing", progress: 10, last_updated: new Date().toISOString() })
      .eq("id", documentId);
      
    // Add processing started event to history
    await supabase
      .from("document_history")
      .insert({
        document_id: documentId,
        status: "processing",
        message: "Document processing started"
      });
    
    // Fetch document metadata
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
      
    if (documentError || !document) {
      throw new Error(`Failed to fetch document: ${documentError?.message || "Document not found"}`);
    }
    
    // Get document file URL
    const { data: signedUrl } = await supabase
      .storage
      .from("documents")
      .createSignedUrl(document.storage_path, 60);
    
    if (!signedUrl?.signedUrl) {
      throw new Error("Failed to generate signed URL for document");
    }
    
    // Update progress
    await supabase
      .from("documents")
      .update({ progress: 30, last_updated: new Date().toISOString() })
      .eq("id", documentId);
    
    // Extract document content
    const extractedContent = await extractDocumentContent(signedUrl.signedUrl, document.type);
    
    // Store extracted content
    await supabase
      .from("document_content")
      .insert({
        document_id: documentId,
        content: extractedContent,
        raw_text: typeof extractedContent === "string" ? extractedContent : JSON.stringify(extractedContent)
      });
    
    // Update progress
    await supabase
      .from("documents")
      .update({ progress: 70, last_updated: new Date().toISOString() })
      .eq("id", documentId);
    
    // Validate document
    const validationIssues = await validateDocument(extractedContent, document.type);
    
    // Store validation issues if any
    if (validationIssues && validationIssues.length > 0) {
      const formattedIssues = validationIssues.map((issue: any) => ({
        document_id: documentId,
        field: issue.field,
        issue: issue.issue,
        severity: issue.severity
      }));
      
      await supabase.from("validation_issues").insert(formattedIssues);
      
      // Update document status based on validation
      const hasCriticalIssues = validationIssues.some((issue: any) => issue.severity === "high");
      await supabase
        .from("documents")
        .update({
          status: hasCriticalIssues ? "rejected" : "verified",
          flagged: hasCriticalIssues,
          progress: 100,
          last_updated: new Date().toISOString()
        })
        .eq("id", documentId);
      
      // Add completion event to history
      await supabase
        .from("document_history")
        .insert({
          document_id: documentId,
          status: hasCriticalIssues ? "rejected" : "verified",
          message: hasCriticalIssues ? "Document has validation issues" : "Document validated successfully"
        });
    } else {
      // No issues found - mark as verified
      await supabase
        .from("documents")
        .update({
          status: "verified",
          flagged: false,
          progress: 100,
          last_updated: new Date().toISOString()
        })
        .eq("id", documentId);
      
      // Add completion event to history
      await supabase
        .from("document_history")
        .insert({
          document_id: documentId,
          status: "verified",
          message: "Document validated successfully with no issues"
        });
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Document processed successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    
    return new Response(
      JSON.stringify({ error: `Document processing failed: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
