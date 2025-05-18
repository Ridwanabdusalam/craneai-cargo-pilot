
import { Document, DocumentStatus, ValidationIssue, ValidationCheck } from '@/types/documents';
import { Json } from '@/integrations/supabase/types';

// Helper function to convert Supabase document format to our Document type
export const formatDocumentFromSupabase = (supabaseDoc: any): Document => {
  // Extract content from document_content array (could be empty)
  const documentContent = supabaseDoc.document_content && supabaseDoc.document_content.length > 0 
    ? supabaseDoc.document_content[0].content 
    : {};
    
  // Extract validation issues
  const validationIssues: ValidationIssue[] = supabaseDoc.validation_issues?.map((issue: any) => ({
    field: issue.field,
    issue: issue.issue,
    severity: issue.severity as 'low' | 'medium' | 'high'
  })) || [];
  
  // Extract validation checks
  const validationChecks: ValidationCheck[] = supabaseDoc.validation_checks?.map((check: any) => ({
    name: check.name,
    description: check.description,
    status: check.status as 'passed' | 'failed' | 'pending',
    details: check.details
  })) || [];
  
  // Extract verified by information
  const verifiedBy = supabaseDoc.verified_by && supabaseDoc.verified_by.length > 0 
    ? {
        username: supabaseDoc.verified_by[0].username,
        fullName: supabaseDoc.verified_by[0].full_name
      }
    : null;

  // Calculate processing time if available
  let processingTime = null;
  if (supabaseDoc.processing_time_ms) {
    const ms = supabaseDoc.processing_time_ms;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      processingTime = `${minutes} min ${seconds % 60} sec`;
    } else {
      processingTime = `${seconds} seconds`;
    }
  }
  
  return {
    id: supabaseDoc.id,
    title: supabaseDoc.title,
    type: supabaseDoc.type,
    status: supabaseDoc.status as DocumentStatus,
    lastUpdated: supabaseDoc.last_updated,
    progress: supabaseDoc.progress,
    flagged: supabaseDoc.flagged,
    content: documentContent,
    validationIssues,
    validationChecks,
    processingTime,
    verifiedBy,
    processingStarted: supabaseDoc.processing_started,
    processingCompleted: supabaseDoc.processing_completed
  };
};
