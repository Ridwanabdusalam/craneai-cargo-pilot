
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, DocumentStatus, ValidationResult, ValidationIssue, ValidationCheck } from '@/types/documents';
import { Json } from '@/integrations/supabase/types';

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        validation_issues (*),
        validation_checks (*),
        document_content (content, raw_text),
        verified_by:profiles(username, full_name)
      `)
      .order('last_updated', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error('Error fetching documents:', error);
    toast.error('Failed to load documents');
    return [];
  }
};

// Get documents by status
export const getDocumentsByStatus = async (status: DocumentStatus): Promise<Document[]> => {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        validation_issues (*),
        validation_checks (*),
        document_content (content, raw_text),
        verified_by:profiles(username, full_name)
      `)
      .eq('status', status)
      .order('last_updated', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error(`Error fetching ${status} documents:`, error);
    toast.error(`Failed to load ${status} documents`);
    return [];
  }
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document | null> => {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        validation_issues (*),
        validation_checks (*),
        document_content (content, raw_text),
        verified_by:profiles(username, full_name)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Error fetching document details:', error);
    toast.error('Failed to load document details');
    return null;
  }
};

// Helper function to convert Supabase document format to our Document type
const formatDocumentFromSupabase = (supabaseDoc: any): Document => {
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

// Upload a new document
export const uploadDocument = async (file: File, title: string): Promise<Document> => {
  try {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    // 2. Create document record in the database
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        title: title || file.name,
        type: `${file.type.split('/')[1].toUpperCase()} Document`,
        status: 'pending',
        progress: 0,
        flagged: false,
        storage_path: filePath
      })
      .select()
      .single();
      
    if (documentError) {
      throw documentError;
    }
    
    // 3. Start document processing via edge function
    const { error: processingError } = await supabase.functions.invoke('process-document', {
      body: { documentId: document.id }
    });
    
    if (processingError) {
      console.error("Error starting document processing:", processingError);
      // Continue anyway - the document is uploaded, we can try processing again later
    }
    
    // 4. Return the created document
    return {
      id: document.id,
      title: document.title,
      type: document.type,
      status: document.status as DocumentStatus,
      lastUpdated: document.last_updated,
      progress: document.progress,
      flagged: document.flagged,
      content: {},
      validationIssues: [],
      validationChecks: [],
      processingTime: null,
      verifiedBy: null
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    toast.error('Failed to upload document');
    throw error;
  }
};

// Search documents
export const searchDocuments = async (query: string): Promise<Document[]> => {
  if (!query) return getAllDocuments();
  
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        validation_issues (*),
        validation_checks (*),
        document_content (content, raw_text),
        verified_by:profiles(username, full_name)
      `)
      .or(`title.ilike.%${query}%,type.ilike.%${query}%`)
      .order('last_updated', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error('Error searching documents:', error);
    toast.error('Failed to search documents');
    return [];
  }
};

// Verify document
export const verifyDocument = async (id: string, userId: string): Promise<ValidationResult> => {
  try {
    // Update document status
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        flagged: false,
        progress: 100,
        last_updated: new Date().toISOString(),
        verified_by: userId
      })
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    // Add history record
    await supabase
      .from('document_history')
      .insert({
        document_id: id,
        status: 'verified',
        message: 'Document manually verified by user'
      });
    
    return { 
      success: true, 
      message: 'Document has been verified and approved'
    };
  } catch (error) {
    console.error('Error verifying document:', error);
    return { success: false, message: 'Failed to verify document' };
  }
};

// Reject document
export const rejectDocument = async (id: string, userId: string, reason: string): Promise<ValidationResult> => {
  try {
    // Update document status
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'rejected',
        flagged: true,
        progress: 100,
        last_updated: new Date().toISOString(),
        verified_by: userId
      })
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    // Add history record
    await supabase
      .from('document_history')
      .insert({
        document_id: id,
        status: 'rejected',
        message: `Document rejected: ${reason}`
      });
    
    return { 
      success: true, 
      message: 'Document has been rejected'
    };
  } catch (error) {
    console.error('Error rejecting document:', error);
    return { success: false, message: 'Failed to reject document' };
  }
};

// Fix document issues
export const fixDocumentIssues = async (id: string, corrections: Record<string, string>): Promise<ValidationResult> => {
  try {
    // Get the current document content
    const { data: contentData, error: contentError } = await supabase
      .from('document_content')
      .select('id, content')
      .eq('document_id', id)
      .single();
      
    if (contentError) {
      throw contentError;
    }
    
    // Apply corrections to content if we have content data
    if (contentData) {
      // Fix: Explicitly type the content and make sure the spread operation is compatible with Json type
      const currentContent = contentData.content as Record<string, unknown>;
      
      // Create a new object that will be compatible with the Json type
      const updatedContent: Json = {};
      
      // First copy all properties from the current content
      Object.entries(currentContent).forEach(([key, value]) => {
        (updatedContent as any)[key] = value;
      });
      
      // Then apply the corrections
      Object.entries(corrections).forEach(([key, value]) => {
        (updatedContent as any)[key] = value;
      });
      
      // Update the content
      const { error: updateError } = await supabase
        .from('document_content')
        .update({ content: updatedContent })
        .eq('id', contentData.id);
        
      if (updateError) {
        throw updateError;
      }
    }
    
    // Clear validation issues
    await supabase
      .from('validation_issues')
      .delete()
      .eq('document_id', id);
    
    // Update document status
    const { error: docUpdateError } = await supabase
      .from('documents')
      .update({
        status: 'pending_verification',
        flagged: false,
        progress: 100,
        last_updated: new Date().toISOString()
      })
      .eq('id', id);
      
    if (docUpdateError) {
      throw docUpdateError;
    }
    
    // Add history record
    await supabase
      .from('document_history')
      .insert({
        document_id: id,
        status: 'pending_verification',
        message: 'Document issues fixed and awaiting verification'
      });
    
    return { 
      success: true, 
      message: 'Document issues have been fixed and document is now awaiting verification'
    };
  } catch (error) {
    console.error('Error fixing document issues:', error);
    return { success: false, message: 'Failed to fix document issues' };
  }
};

// Download document
export const downloadDocument = async (id: string): Promise<string | null> => {
  try {
    // Get the document to find its storage path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single();
      
    if (docError || !document?.storage_path) {
      throw docError || new Error('Document file not found');
    }
    
    // Generate a download URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 60); // 60 seconds expiry
      
    if (urlError) {
      throw urlError;
    }
    
    return urlData.signedUrl;
  } catch (error) {
    console.error('Error generating document download link:', error);
    toast.error('Failed to download document');
    return null;
  }
};
