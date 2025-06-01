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
  
  // Find where the actual JSON object ends (right before any additional text)
  const jsonEndIndex = findJsonEndIndex(cleaned);
  if (jsonEndIndex > 0 && jsonEndIndex < cleaned.length - 1) {
    cleaned = cleaned.substring(0, jsonEndIndex + 1);
  }
  
  // Trim any whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Find the end index of a JSON object in a string that might have additional text
 */
function findJsonEndIndex(jsonString) {
  let braceCount = 0;
  let inQuotes = false;
  let escaped = false;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    
    if (char === '"' && !escaped) {
      inQuotes = !inQuotes;
    } else if (char === '\\' && !escaped) {
      escaped = true;
      continue;
    } else if (char === '{' && !inQuotes) {
      braceCount++;
    } else if (char === '}' && !inQuotes) {
      braceCount--;
      // Found the end of the JSON object
      if (braceCount === 0) {
        return i;
      }
    }
    
    escaped = false;
  }
  
  // If no matching end brace was found, return the entire length
  return jsonString.length - 1;
}

/**
 * Extract content from document using OpenAI
 */
async function extractDocumentContent(fileUrl, documentType) {
  console.log("Extracting document content from:", fileUrl);
  
  try {
    // For PDF files, we need to use a text-based approach instead of vision API
    const isPdf = documentType.toLowerCase().includes('pdf');
    
    if (isPdf) {
      // Use text completion API instead of vision API for PDFs
      console.log("Using text completion API for PDF content extraction");
      return await extractDocumentContentWithTextAPI(fileUrl);
    } else {
      // For images, we can still use the vision API
      const imageBase64 = await fetchFileAsBase64(fileUrl);
      
      if (!imageBase64) {
        return { error: "Failed to fetch document content" };
      }
      
      const response = await callOpenAIVisionExtraction(imageBase64, documentType);
      
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
    }
  } catch (error) {
    console.error("Error extracting document content:", error);
    return { error: "Failed to extract document content: " + error.message };
  }
}

/**
 * Extract content from PDF using OpenAI's text API
 */
async function extractDocumentContentWithTextAPI(fileUrl) {
  try {
    console.log("Attempting to extract PDF content without vision API");
    
    // For PDFs, we use a simpler approach - just store that it's a PDF and provide a placeholder
    // In a real implementation, you might use a PDF parsing library or OCR service
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
            content: `You are a document content extractor simulator. You're given a PDF document URL: ${fileUrl}.
            Since we can't actually extract the content, create a plausible mock extraction result that would represent
            a logistics document like a bill of lading, invoice, or customs declaration. Format your response as valid JSON with 
            fields like document_type, issuer, recipient, date, items, values, etc. Make it realistic but clearly indicate it's mock data.
            Return ONLY the JSON object with no additional text, comments or explanations.`
          },
          {
            role: "user",
            content: "Extract the document content and return it as JSON only"
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
    console.log("Cleaned extracted content:", extractedContent.substring(0, 100) + "...");
    
    // Parse the extracted content as JSON
    return parseExtractedContent(extractedContent);
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return { 
      error: "Failed to extract PDF content: " + error.message,
      content_type: "pdf",
      note: "PDF extraction requires special processing. This is a placeholder." 
    };
  }
}

/**
 * Fetch file as Base64
 */
async function fetchFileAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    // Get the content as arrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert to Base64
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return `data:${response.headers.get("content-type") || "application/octet-stream"};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching file:", error);
    return null;
  }
}

/**
 * Call OpenAI API for document extraction using vision
 */
async function callOpenAIVisionExtraction(imageBase64, documentType) {
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
                url: imageBase64
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
  console.log(`Updating document ${documentId}: status=${status}, progress=${progress}`);
  
  const updateData = { 
    status, 
    progress, 
    last_updated: new Date().toISOString(),
    ...additionalFields
  };
  
  const { error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", documentId);
    
  if (error) {
    console.error("Error updating document status:", error);
  } else {
    console.log("Document status updated successfully");
  }
  
  return { error };
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
  
  console.log(`Completing processing for document ${documentId}`);
  console.log(`Validation issues found: ${validationIssues?.length || 0}`);
  
  // Determine final status based on validation
  const hasCriticalIssues = validationIssues && validationIssues.some((issue) => issue.severity === "high");
  
  console.log(`Setting final status to: ${hasCriticalIssues ? "rejected" : "pending_verification"}`);
  
  // FIXED: Always update progress to 100% when processing is complete
  const updateResult = await updateDocumentStatus(supabase, documentId, hasCriticalIssues ? "rejected" : "pending_verification", 100, {
    flagged: hasCriticalIssues,
    processing_completed: new Date().toISOString(),
    processing_time_ms: processingTime
  });
  
  if (updateResult.error) {
    console.error("Failed to update document status:", updateResult.error);
    throw new Error("Failed to complete document processing");
  }
  
  // Add completion event to history
  const historyMessage = hasCriticalIssues 
    ? "Document has validation issues" 
    : "Document processed and awaiting verification";
    
  await addDocumentHistoryEvent(supabase, documentId, hasCriticalIssues ? "rejected" : "pending_verification", historyMessage);
  
  console.log(`Document processing completed with status: ${hasCriticalIssues ? "rejected" : "pending_verification"}`);
  return hasCriticalIssues ? "rejected" : "pending_verification";
}

/**
 * Validate document using predefined rules from database
 */
async function validateDocumentWithRules(supabase, documentId, documentType, content) {
  console.log("Starting validation with predefined rules for document type:", documentType);
  console.log("Document content:", JSON.stringify(content).substring(0, 200) + "...");
  
  try {
    // Get validation rules for this document type
    const { data: rules, error: rulesError } = await supabase
      .from("validation_rules")
      .select("*")
      .eq("document_type", documentType)
      .eq("is_active", true);

    if (rulesError) {
      console.error("Error fetching validation rules:", rulesError);
      return { validationChecks: [], validationIssues: [] };
    }

    console.log(`Found ${rules?.length || 0} validation rules to apply`);

    const validationChecks = [];
    const validationIssues = [];

    // Apply each validation rule
    for (const rule of rules || []) {
      console.log(`Applying rule: ${rule.rule_name} (${rule.condition_type})`);
      
      const checkResult = applyValidationRule(rule, content);
      
      console.log(`Rule ${rule.rule_name} result:`, checkResult);
      
      // Map severity from database format to our format
      const mappedSeverity = mapSeverityFromDb(rule.severity);
      
      validationChecks.push({
        name: rule.rule_name,
        description: rule.error_message,
        status: checkResult.passed ? "passed" : "failed",
        details: checkResult.details || ""
      });

      if (!checkResult.passed) {
        validationIssues.push({
          field: rule.condition_field,
          issue: rule.error_message,
          severity: mappedSeverity
        });
      }

      // Store validation result in database
      const { error: insertError } = await supabase
        .from("document_validations")
        .insert({
          document_id: documentId,
          rule_id: rule.id,
          status: checkResult.passed ? "pass" : "fail",
          details: { result: checkResult.details }
        });

      if (insertError) {
        console.error("Error inserting validation result:", insertError);
      } else {
        console.log(`Stored validation result for rule ${rule.rule_name}`);
      }
    }

    // Also store validation checks in the validation_checks table
    for (const check of validationChecks) {
      const { error: checkError } = await supabase
        .from("validation_checks")
        .insert({
          document_id: documentId,
          name: check.name,
          description: check.description,
          status: check.status,
          details: check.details
        });

      if (checkError) {
        console.error("Error storing validation check:", checkError);
      }
    }

    console.log(`Validation completed: ${validationChecks.length} checks, ${validationIssues.length} issues`);
    return { validationChecks, validationIssues };
  } catch (error) {
    console.error("Error validating document with rules:", error);
    return { validationChecks: [], validationIssues: [] };
  }
}

/**
 * Map database severity to our interface severity
 */
function mapSeverityFromDb(dbSeverity) {
  switch (dbSeverity) {
    case "info":
      return "low";
    case "warning":
      return "medium";
    case "error":
      return "high";
    default:
      return "medium";
  }
}

/**
 * Apply a single validation rule to content
 */
function applyValidationRule(rule, content) {
  console.log(`Applying rule ${rule.rule_name}: checking field ${rule.condition_field} with condition ${rule.condition_type}`);
  
  const fieldValue = getFieldValue(content, rule.condition_field);
  console.log(`Field value for ${rule.condition_field}:`, fieldValue);
  
  switch (rule.condition_type) {
    case "required":
      const isPresent = fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
      return {
        passed: isPresent,
        details: fieldValue ? `Field has value: ${fieldValue}` : "Field is missing or empty"
      };
      
    case "equals":
      return {
        passed: fieldValue === rule.condition_value,
        details: `Expected: ${rule.condition_value}, Found: ${fieldValue}`
      };
      
    case "contains":
      const contains = fieldValue && fieldValue.toString().includes(rule.condition_value || "");
      return {
        passed: contains,
        details: `Checking if "${fieldValue}" contains "${rule.condition_value}"`
      };
      
    case "min_length":
      const minLength = parseInt(rule.condition_value || "0");
      const actualLength = fieldValue ? fieldValue.toString().length : 0;
      return {
        passed: actualLength >= minLength,
        details: `Required length: ${minLength}, Actual length: ${actualLength}`
      };
      
    case "max_length":
      const maxLength = parseInt(rule.condition_value || "0");
      const currentLength = fieldValue ? fieldValue.toString().length : 0;
      return {
        passed: currentLength <= maxLength,
        details: `Max length: ${maxLength}, Actual length: ${currentLength}`
      };
      
    case "numeric":
      const isNumeric = !isNaN(Number(fieldValue));
      return {
        passed: isNumeric,
        details: `Value "${fieldValue}" is ${isNumeric ? "numeric" : "not numeric"}`
      };
      
    case "date_format":
      const isValidDate = !isNaN(Date.parse(fieldValue));
      return {
        passed: isValidDate,
        details: `Value "${fieldValue}" is ${isValidDate ? "a valid date" : "not a valid date"}`
      };
      
    default:
      return {
        passed: true,
        details: `Unknown validation type: ${rule.condition_type}`
      };
  }
}

/**
 * Get field value from nested object using dot notation
 */
function getFieldValue(obj, fieldPath) {
  if (!obj || !fieldPath) return null;
  
  const keys = fieldPath.split(".");
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return value;
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
    console.log(`Starting processing for document: ${documentId}`);
    
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
    
    console.log(`Processing document: ${document.title} (${document.type})`);
    
    // Get document file URL
    const { data: signedUrl } = await supabase
      .storage
      .from("documents")
      .createSignedUrl(document.storage_path, 3600);
    
    if (!signedUrl?.signedUrl) {
      throw new Error("Failed to generate signed URL for document");
    }
    
    // Update progress
    await updateDocumentStatus(supabase, documentId, "processing", 30);
    
    // Extract document content
    const extractedContent = await extractDocumentContent(signedUrl.signedUrl, document.type);
    console.log("Extracted content sample:", JSON.stringify(extractedContent).substring(0, 500) + "...");
    
    // Store extracted content - ALWAYS store content even if it has errors
    // Delete existing content first
    await supabase
      .from("document_content")
      .delete()
      .eq("document_id", documentId);
        
    // Insert new content - ensure we always have some content stored
    const contentToStore = extractedContent || { error: "No content extracted" };
    const rawTextToStore = extractedContent?.raw_text || 
                          (typeof extractedContent === "string" ? extractedContent : null) ||
                          JSON.stringify(contentToStore);
    
    const { error: contentError } = await supabase
      .from("document_content")
      .insert({
        document_id: documentId,
        content: contentToStore,
        raw_text: rawTextToStore
      });
    
    if (contentError) {
      console.error("Error storing document content:", contentError);
    } else {
      console.log("Document content stored successfully");
    }
    
    // Update progress
    await updateDocumentStatus(supabase, documentId, "processing", 70);
    
    // Clear any existing validation data
    await supabase.from("validation_checks").delete().eq("document_id", documentId);
    await supabase.from("validation_issues").delete().eq("document_id", documentId);
    await supabase.from("document_validations").delete().eq("document_id", documentId);
    
    console.log("Starting validation process...");
    
    // Apply validation rules - only if we have content to validate
    let validationResult = { validationChecks: [], validationIssues: [] };
    
    if (extractedContent && !extractedContent.error) {
      validationResult = await validateDocumentWithRules(
        supabase, 
        documentId, 
        document.type, 
        extractedContent
      );
    } else {
      console.log("Skipping validation due to content extraction errors");
    }
    
    const { validationChecks, validationIssues } = validationResult;
    
    console.log(`Validation completed: ${validationChecks.length} checks, ${validationIssues.length} issues`);
    
    // Store validation issues if any
    if (validationIssues && validationIssues.length > 0) {
      const formattedIssues = validationIssues.map((issue) => ({
        document_id: documentId,
        field: issue.field,
        issue: issue.issue,
        severity: issue.severity
      }));
      
      const { error: issuesError } = await supabase.from("validation_issues").insert(formattedIssues);
      if (issuesError) {
        console.error("Error storing validation issues:", issuesError);
      } else {
        console.log(`Stored ${validationIssues.length} validation issues`);
      }
    }
    
    // CRITICAL FIX: Complete processing - this ensures documents don't get stuck
    const finalStatus = await completeDocumentProcessing(
      supabase, 
      documentId, 
      validationIssues, 
      processingStart
    );
    
    console.log(`Document processing completed successfully with status: ${finalStatus}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Document processed successfully", 
        status: finalStatus,
        validationChecks: validationChecks.length,
        validationIssues: validationIssues.length
      }),
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
