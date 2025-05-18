
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Clean OpenAI response from markdown formatting
 */
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

/**
 * Convert PDF to Base64 for processing
 */
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

/**
 * Extract content from document using OpenAI
 */
async function extractDocumentContent(fileUrl, documentType) {
  console.log("Extracting document content from:", fileUrl);
  
  try {
    // Fetch the PDF content as base64 to pass to OpenAI
    const pdfBase64 = await fetchPdfContent(fileUrl);
    
    if (!pdfBase64) {
      return { error: "Failed to fetch document content" };
    }
    
    const response = await callOpenAIExtraction(pdfBase64, documentType);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    const data = await response.json();
    let extractedContent = data.choices[0].message.content;
    
    // Clean the response from any markdown formatting
    extractedContent = cleanJsonResponse(extractedContent);
    
    // Parse the extracted content as JSON
    return parseExtractedContent(extractedContent);
  } catch (error) {
    console.error("Error extracting document content:", error);
    return { error: "Failed to extract document content: " + error.message };
  }
}

/**
 * Call OpenAI API for document extraction
 */
async function callOpenAIExtraction(pdfBase64, documentType) {
  return await fetch("https://api.openai.com/v1/chat/completions", {
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
}

/**
 * Parse extracted content from OpenAI response
 */
function parseExtractedContent(extractedContent) {
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
}

/**
 * Validate document using AI
 */
async function validateDocument(content, documentType) {
  console.log("Validating document:", documentType);
  
  try {
    const response = await callOpenAIValidation(content, documentType);
    const data = await response.json();
    let validationResult = data.choices[0].message.content;
    
    // Clean the response from any markdown formatting
    validationResult = cleanJsonResponse(validationResult);
    
    return parseValidationResult(validationResult);
  } catch (error) {
    console.error("Error validating document:", error);
    return {
      validationChecks: [],
      validationIssues: []
    };
  }
}

/**
 * Call OpenAI API for document validation
 */
async function callOpenAIValidation(content, documentType) {
  return await fetch("https://api.openai.com/v1/chat/completions", {
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
}

/**
 * Parse validation result from OpenAI response
 */
function parseValidationResult(validationResult) {
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
}

/**
 * Update document status in database
 */
async function updateDocumentStatus(supabase, documentId, status, progress, additionalFields = {}) {
  return await supabase
    .from("documents")
    .update({ 
      status, 
      progress, 
      last_updated: new Date().toISOString(),
      ...additionalFields
    })
    .eq("id", documentId);
}

/**
 * Add event to document history
 */
async function addDocumentHistoryEvent(supabase, documentId, status, message) {
  return await supabase
    .from("document_history")
    .insert({
      document_id: documentId,
      status,
      message
    });
}

/**
 * Store validation checks in database
 */
async function storeValidationChecks(supabase, documentId, validationChecks) {
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
}

/**
 * Store validation issues in database
 */
async function storeValidationIssues(supabase, documentId, validationIssues) {
  if (validationIssues && validationIssues.length > 0) {
    const formattedIssues = validationIssues.map((issue) => ({
      document_id: documentId,
      field: issue.field,
      issue: issue.issue,
      severity: issue.severity
    }));
    
    return await supabase.from("validation_issues").insert(formattedIssues);
  }
  return null;
}

/**
 * Complete document processing and update status
 */
async function completeDocumentProcessing(supabase, documentId, validationIssues, processingStart) {
  const processingEnd = new Date();
  const processingTime = processingEnd.getTime() - processingStart.getTime();
  
  // Determine final status based on validation
  const hasCriticalIssues = validationIssues && validationIssues.some((issue) => issue.severity === "high");
  const finalStatus = hasCriticalIssues ? "rejected" : "pending_verification";
  
  // Update document with final status
  await updateDocumentStatus(supabase, documentId, finalStatus, 100, {
    flagged: hasCriticalIssues,
    processing_completed: new Date().toISOString(),
    processing_time_ms: processingTime
  });
  
  // Add completion event to history
  const historyMessage = hasCriticalIssues 
    ? "Document has validation issues" 
    : "Document processed and awaiting verification";
    
  await addDocumentHistoryEvent(supabase, documentId, finalStatus, historyMessage);
  
  return finalStatus;
}

/**
 * Main handler for document processing
 */
serve(async (req) => {
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
    await updateDocumentStatus(supabase, documentId, "processing", 10, {
      processing_started: new Date().toISOString()
    });
      
    // Add processing started event to history
    await addDocumentHistoryEvent(
      supabase, 
      documentId, 
      "processing", 
      "Document processing started"
    );
    
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
    await updateDocumentStatus(supabase, documentId, "processing", 30);
    
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
    await updateDocumentStatus(supabase, documentId, "processing", 70);
    
    // Validate document
    const validationResult = await validateDocument(extractedContent, document.type);
    const { validationChecks, validationIssues } = validationResult;
    
    // Store validation checks
    await storeValidationChecks(supabase, documentId, validationChecks);
    
    // Store validation issues if any
    await storeValidationIssues(supabase, documentId, validationIssues);
    
    // Complete document processing and get final status
    const finalStatus = await completeDocumentProcessing(
      supabase, 
      documentId, 
      validationIssues, 
      processingStart
    );
    
    return new Response(
      JSON.stringify({ success: true, message: "Document processed successfully", status: finalStatus }),
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
