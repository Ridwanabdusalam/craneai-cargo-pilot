
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/documents';
import { formatDocumentFromSupabase } from './documentFormatters';
import { 
  validateFile, 
  validateDocumentTitle, 
  validateDocumentType, 
  sanitizeString,
  validateUserId
} from './documentSecurity';

export interface DocumentUploadData {
  title: string;
  type: string;
  file: File;
  description?: string;
}

export async function uploadDocument(data: DocumentUploadData): Promise<Document> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Validate user ID format
  if (!validateUserId(user.id)) {
    throw new Error('Invalid user session');
  }

  // Validate file
  const fileValidation = validateFile(data.file);
  if (!fileValidation.isValid) {
    throw new Error(fileValidation.error);
  }

  // Validate title
  const titleValidation = validateDocumentTitle(data.title);
  if (!titleValidation.isValid) {
    throw new Error(titleValidation.error);
  }

  // Validate document type
  const typeValidation = validateDocumentType(data.type);
  if (!typeValidation.isValid) {
    throw new Error(typeValidation.error);
  }

  // Sanitize inputs
  const sanitizedTitle = sanitizeString(data.title, 255);
  const sanitizedDescription = data.description ? sanitizeString(data.description, 1000) : null;

  try {
    // Insert document record with proper user assignment
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        title: sanitizedTitle,
        type: data.type,
        status: 'pending',
        progress: 0,
        flagged: false,
        created_by: user.id, // Explicitly set the user ID
        storage_path: `/documents/${user.id}/${Date.now()}-${data.file.name}`,
        last_updated: new Date().toISOString()
      })
      .select(`
        *,
        document_validations(
          id,
          status,
          details,
          validation_rules(
            rule_name,
            error_message,
            description
          )
        ),
        validation_issues(
          id,
          field,
          issue,
          severity
        )
      `)
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document record');
    }

    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Document upload error:', error);
    throw new Error('Failed to upload document');
  }
}

export async function verifyDocument(documentId: string): Promise<Document> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Validate document ID format
  if (!validateUserId(documentId)) {
    throw new Error('Invalid document ID format');
  }

  // Get the user's profile to check verification permissions
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  try {
    // Update document status to verified
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        progress: 100,
        last_updated: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('created_by', user.id) // Ensure user owns the document
      .select(`
        *,
        document_validations(
          id,
          status,
          details,
          validation_rules(
            rule_name,
            error_message,
            description
          )
        ),
        validation_issues(
          id,
          field,
          issue,
          severity
        )
      `)
      .single();

    if (error) {
      console.error('Error verifying document:', error);
      throw new Error('Failed to verify document');
    }

    if (!document) {
      throw new Error('Document not found or access denied');
    }

    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Document verification error:', error);
    throw new Error('Failed to verify document');
  }
}

export async function rejectDocument(documentId: string, reason: string): Promise<Document> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Validate inputs
  if (!validateUserId(documentId)) {
    throw new Error('Invalid document ID format');
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  if (reason.length > 1000) {
    throw new Error('Rejection reason is too long');
  }

  const sanitizedReason = sanitizeString(reason, 1000);

  try {
    // Update document status to rejected
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status: 'rejected',
        flagged: true,
        last_updated: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('created_by', user.id) // Ensure user owns the document
      .select(`
        *,
        document_validations(
          id,
          status,
          details,
          validation_rules(
            rule_name,
            error_message,
            description
          )
        ),
        validation_issues(
          id,
          field,
          issue,
          severity
        )
      `)
      .single();

    if (error) {
      console.error('Error rejecting document:', error);
      throw new Error('Failed to reject document');
    }

    if (!document) {
      throw new Error('Document not found or access denied');
    }

    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Document rejection error:', error);
    throw new Error('Failed to reject document');
  }
}

export async function fixDocumentIssues(documentId: string, fixes: Record<string, any>): Promise<Document> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Validate document ID
  if (!validateUserId(documentId)) {
    throw new Error('Invalid document ID format');
  }

  // Validate and sanitize fixes
  const sanitizedFixes: Record<string, any> = {};
  for (const [key, value] of Object.entries(fixes)) {
    if (typeof value === 'string') {
      sanitizedFixes[key] = sanitizeString(value, 500);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitizedFixes[key] = value;
    } else if (typeof value === 'boolean') {
      sanitizedFixes[key] = value;
    }
    // Skip other types for security
  }

  try {
    // Update document status to processing
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        status: 'processing',
        flagged: false,
        last_updated: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('created_by', user.id) // Ensure user owns the document
      .select(`
        *,
        document_validations(
          id,
          status,
          details,
          validation_rules(
            rule_name,
            error_message,
            description
          )
        ),
        validation_issues(
          id,
          field,
          issue,
          severity
        )
      `)
      .single();

    if (error) {
      console.error('Error fixing document issues:', error);
      throw new Error('Failed to fix document issues');
    }

    if (!document) {
      throw new Error('Document not found or access denied');
    }

    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Document fix error:', error);
    throw new Error('Failed to fix document issues');
  }
}
