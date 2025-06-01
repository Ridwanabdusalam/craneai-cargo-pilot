
import { Document, ValidationCheck, ValidationIssue } from '@/types/documents';

export function formatDocumentFromSupabase(supabaseDoc: any): Document {
  // Extract validation checks
  const validationChecks: ValidationCheck[] = (supabaseDoc.validation_checks || []).map((check: any) => ({
    name: check.name,
    description: check.description,
    status: check.status as 'passed' | 'failed' | 'pending',
    details: check.details || ''
  }));

  // Extract validation issues
  const validationIssues: ValidationIssue[] = (supabaseDoc.validation_issues || []).map((issue: any) => ({
    field: issue.field,
    issue: issue.issue,
    severity: issue.severity as 'low' | 'medium' | 'high'
  }));

  // Get document content if available
  const content = supabaseDoc.document_content?.[0]?.content || {};

  // Calculate processing time if available
  let processingTime = null;
  if (supabaseDoc.processing_started && supabaseDoc.processing_completed) {
    const start = new Date(supabaseDoc.processing_started);
    const end = new Date(supabaseDoc.processing_completed);
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    processingTime = `${diffSeconds}s`;
  }

  return {
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
}
