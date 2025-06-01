
import { Document, ValidationCheck, ValidationIssue } from '@/types/documents';

export function formatDocumentFromSupabase(supabaseDoc: any): Document {
  console.log("Formatting document from Supabase:", supabaseDoc);
  
  // Extract validation checks from document_validations with rule details
  const validationChecks: ValidationCheck[] = (supabaseDoc.document_validations || []).map((validation: any) => ({
    name: validation.validation_rules?.rule_name || 'Unknown Rule',
    description: validation.validation_rules?.description || validation.validation_rules?.error_message || 'No description available',
    status: mapValidationStatus(validation.status),
    details: validation.details?.result || ''
  }));

  // Extract validation issues
  const validationIssues: ValidationIssue[] = (supabaseDoc.validation_issues || []).map((issue: any) => ({
    field: issue.field,
    issue: issue.issue,
    severity: issue.severity as 'low' | 'medium' | 'high'
  }));

  // FIXED: Improved content extraction to handle the exact database structure
  let content = {};
  
  console.log("Document content array:", supabaseDoc.document_content);
  
  if (supabaseDoc.document_content && Array.isArray(supabaseDoc.document_content) && supabaseDoc.document_content.length > 0) {
    const contentRecord = supabaseDoc.document_content[0];
    console.log("Raw content record:", contentRecord);
    console.log("Content record keys:", Object.keys(contentRecord || {}));
    
    // First priority: get the structured content from the 'content' field
    if (contentRecord.content && typeof contentRecord.content === 'object') {
      content = { ...contentRecord.content };
      console.log("Extracted structured content:", content);
    }
    
    // Second priority: if no structured content but we have raw_text, use that
    if ((!content || Object.keys(content).length === 0) && contentRecord.raw_text) {
      try {
        // Try to parse raw_text as JSON first
        const parsedRawText = JSON.parse(contentRecord.raw_text);
        content = parsedRawText;
        console.log("Parsed raw_text as JSON:", content);
      } catch (e) {
        // If parsing fails, store as raw text
        content = { raw_text: contentRecord.raw_text };
        console.log("Stored raw_text as plain text");
      }
    }
    
    // Always include raw_text if available and not already present
    if (contentRecord.raw_text && content && typeof content === 'object') {
      if (!(content as any).raw_text) {
        (content as any).raw_text = contentRecord.raw_text;
        console.log("Added raw_text to structured content");
      }
    }
  } else {
    console.log("No document_content found or empty array");
  }
  
  console.log("Final processed content:", content);
  console.log("Content has keys:", Object.keys(content || {}));

  // Calculate processing time if available
  let processingTime = null;
  if (supabaseDoc.processing_started && supabaseDoc.processing_completed) {
    const start = new Date(supabaseDoc.processing_started);
    const end = new Date(supabaseDoc.processing_completed);
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    processingTime = `${diffSeconds}s`;
  }

  const formattedDocument = {
    id: supabaseDoc.id,
    title: supabaseDoc.title,
    type: supabaseDoc.type,
    status: supabaseDoc.status,
    lastUpdated: supabaseDoc.last_updated,
    progress: supabaseDoc.progress || 0,
    flagged: supabaseDoc.flagged || false,
    content,
    validationIssues,
    validationChecks,
    processingTime,
    verifiedBy: null, // This would need to be fetched from a user join if needed
    processingStarted: supabaseDoc.processing_started,
    processingCompleted: supabaseDoc.processing_completed
  };
  
  console.log("Final formatted document:", formattedDocument);
  console.log("Final content keys:", Object.keys(formattedDocument.content || {}));
  return formattedDocument;
}

// Map database validation status to our interface status
function mapValidationStatus(dbStatus: string): 'passed' | 'failed' | 'pending' {
  switch (dbStatus) {
    case 'pass':
      return 'passed';
    case 'fail':
      return 'failed';
    default:
      return 'pending';
  }
}
