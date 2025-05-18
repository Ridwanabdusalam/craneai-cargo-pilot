
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
  
  // Remove any "I'm sorry" or explanatory text before the actual JSON
  const jsonStartIndex = cleaned.indexOf('{');
  if (jsonStartIndex > 0) {
    cleaned = cleaned.substring(jsonStartIndex);
  }
  
  // Trim any whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Convert Base64 to Buffer for PDFs
async function fetchPdfContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    // Get the content as arrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert to Base64
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return `data:application/pdf;base64,${base64}`;
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return null;
  }
}

// Helper to extract text from a PDF document using OpenAI
async function extractDocumentContent(fileUrl: string, documentType: string) {
  console.log("Extracting document content from:", fileUrl);
  
  try {
    // Fetch the PDF content as base64 to pass to OpenAI
    const pdfBase64 = await fetchPdfContent(fileUrl);
    
    if (!pdfBase64) {
      return { error: "Failed to fetch document content" };
    }
    
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
            Extract all relevant fields and values from the provided document. 
            Format your response as a valid JSON object with fields organized by category.
            DO NOT include any text outside the JSON, no introduction, no explanation, ONLY return raw JSON.
            For documents like commercial invoices, extract invoice number, dates, company details, amounts, line items.
            For bills of lading, extract vessel details, container numbers, ports, cargo descriptions.
            For certificates, extract certificate numbers, issuers, validity periods, standards referenced.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract all relevant information from this ${documentType}. Respond with structured JSON only.`
              },
              {
                type: "image_url",
                image_url: {
                  url: pdfBase64
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
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
      const jsonContent = JSON.parse(extractedContent);
      console.log("Successfully parsed document content");
      return jsonContent;
    } catch (parseError) {
      console.error("Failed to parse extracted content as JSON:", parseError);
      console.log("Raw content:", extractedContent);
      
      // If there's content but it's not valid JSON, return it as raw text
      return { 
        error: "Failed to parse document content as structured JSON",
        raw_text: extractedContent
      };
    }
  } catch (error) {
    console.error("Error extracting document content:", error);
    return { error: "Failed to extract document content: " + error.message };
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
            
            Return a JSON array with two properties:
            1. "validationChecks": An array of validation checks performed, each with these properties:
               - name: Name of the check performed
               - description: Description of what was checked
               - status: Either "passed", "failed", or "pending"
               - details: Additional details about the check result
            
            2. "validationIssues": An array of issues found, each with these properties:
               - field: The specific field with the issue
               - issue: Description of the problem
               - severity: Either "low", "medium", or "high"
            
            If no issues are found, include an empty array for validationIssues.
            DO NOT include any text outside the JSON, no markdown formatting, ONLY return raw JSON.`
          },
          {
            role: "user",
            content: `Validate this ${documentType} content:\n${JSON.stringify(content)}`
          }
        ],
        max_tokens: 2000,
      }),
    });
    
    const data = await response.json();
    let validationResult = data.choices[0].message.content;
    
    // Clean the response from any markdown formatting
    validationResult = cleanJsonResponse(validationResult);
    
    try {
      const result = JSON.parse(validationResult);
      return {
        validationChecks: result.validationChecks || [],
        validationIssues: result.validationIssues || []
      };
    } catch (parseError) {
      console.error("Failed to parse validation result as JSON:", parseError);
      return {
        validationChecks: [],
        validationIssues: []
      };
    }
  } catch (error) {
    console.error("Error validating document:", error);
    return {
      validationChecks: [],
      validationIssues: []
    };
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
    
    const processingStart = new Date();
    
    // Update document status to processing
    await supabase
      .from("documents")
      .update({ 
        status: "processing", 
        progress: 10, 
        last_updated: new Date().toISOString(),
        processing_started: new Date().toISOString()
      })
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
      .createSignedUrl(document.storage_path, 3600); // 1 hour expiry for processing
    
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
    const validationResult = await validateDocument(extractedContent, document.type);
    const { validationChecks, validationIssues } = validationResult;
    
    // Store validation checks
    if (validationChecks && validationChecks.length > 0) {
      for (const check of validationChecks) {
        await supabase
          .from("validation_checks")
          .insert({
            document_id: documentId,
            name: check.name,
            description: check.description,
            status: check.status,
            details: check.details
          });
      }
    }
    
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
      
      const processingEnd = new Date();
      const processingTime = processingEnd.getTime() - processingStart.getTime();
      
      await supabase
        .from("documents")
        .update({
          status: hasCriticalIssues ? "rejected" : "pending_verification",
          flagged: hasCriticalIssues,
          progress: 100,
          last_updated: new Date().toISOString(),
          processing_completed: new Date().toISOString(),
          processing_time_ms: processingTime
        })
        .eq("id", documentId);
      
      // Add completion event to history
      await supabase
        .from("document_history")
        .insert({
          document_id: documentId,
          status: hasCriticalIssues ? "rejected" : "pending_verification",
          message: hasCriticalIssues ? "Document has validation issues" : "Document processed and awaiting verification"
        });
    } else {
      // No issues found - mark as pending verification
      const processingEnd = new Date();
      const processingTime = processingEnd.getTime() - processingStart.getTime();
      
      await supabase
        .from("documents")
        .update({
          status: "pending_verification",
          flagged: false,
          progress: 100,
          last_updated: new Date().toISOString(),
          processing_completed: new Date().toISOString(),
          processing_time_ms: processingTime
        })
        .eq("id", documentId);
      
      // Add completion event to history
      await supabase
        .from("document_history")
        .insert({
          document_id: documentId,
          status: "pending_verification",
          message: "Document processed successfully and awaiting human verification"
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
