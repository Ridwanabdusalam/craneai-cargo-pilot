import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ValidationResult } from '@/types/documents';

// Upload a new document
export const uploadDocument = async (file: File, title: string): Promise<any> => {
  try {
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
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
      console.error('Error creating document record:', documentError);
      throw documentError;
    }
    
    if (!document) {
      throw new Error('Document created but no data returned');
    }
    
    // 3. Start document processing via edge function
    try {
      await supabase.functions.invoke('process-document', {
        body: { documentId: document.id }
      });
    } catch (processingError) {
      console.error("Error starting document processing:", processingError);
      // Continue anyway - the document is uploaded, we can try processing again later
    }
    
    // 4. Return the created document
    return {
      id: document.id,
      title: document.title,
      type: document.type,
      status: document.status,
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
    throw error; // Let the calling component handle UI notifications
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
      const updatedContent: any = {};
      
      // First copy all properties from the current content
      Object.entries(currentContent).forEach(([key, value]) => {
        updatedContent[key] = value;
      });
      
      // Then apply the corrections
      Object.entries(corrections).forEach(([key, value]) => {
        updatedContent[key] = value;
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
