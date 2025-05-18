import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ValidationResult } from '@/types/documents';

// Upload a new document
export const uploadDocument = async (file: File, title: string): Promise<any> => {
  try {
    console.log(`Starting document upload: ${title}`);
    
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const filePath = `${fileName}.${fileExt}`;
    
    console.log(`Uploading file to storage path: ${filePath}`);
    
    // Upload the file directly without checking if bucket exists
    // The bucket has been created via SQL migration
    const { error: uploadError, data: storageData } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
    
    console.log('File uploaded to storage successfully', storageData);
    
    // 2. Create document record in the database
    console.log('Creating document record in database');
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        title: title || file.name,
        type: getDocumentType(file),
        status: 'pending',
        progress: 0,
        flagged: false,
        storage_path: filePath,
        last_updated: new Date().toISOString() // Ensure last_updated is set
      })
      .select()
      .single();
      
    if (documentError) {
      console.error('Error creating document record:', documentError);
      // Try to clean up the uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      throw new Error(`Database insert failed: ${documentError.message}`);
    }
    
    if (!document) {
      // Try to clean up the uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      throw new Error('Document created but no data returned');
    }
    
    console.log('Document record created in database:', document);
    
    // 3. Create empty document content
    console.log('Creating document content record');
    const { error: contentError } = await supabase
      .from('document_content')
      .insert({
        document_id: document.id,
        content: {},
        raw_text: ''
      });
      
    if (contentError) {
      console.error('Error creating document content:', contentError);
      // Continue anyway - the document is uploaded, we can try processing again later
    }
    
    // 4. Start document processing via edge function - with proper error handling
    try {
      console.log('Invoking document processing function');
      const { error: functionError } = await supabase.functions.invoke('process-document', {
        body: { documentId: document.id }
      });
      
      if (functionError) {
        console.error('Error invoking processing function:', functionError);
        // Continue anyway - the document is uploaded, processing can be retried
      } else {
        console.log('Document processing started successfully');
      }
    } catch (processingError) {
      console.error("Error starting document processing:", processingError);
      // Continue anyway - the document is uploaded, processing can be retried
    }
    
    // 5. Return the created document
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
  } catch (error: any) {
    console.error('Error uploading document:', error);
    throw error; // Let the calling component handle UI notifications
  }
};

// Helper function to get document type from file
function getDocumentType(file: File): string {
  const mimeType = file.type;
  if (mimeType.includes('pdf')) {
    return 'PDF Document';
  } else if (mimeType.includes('word') || mimeType.includes('docx') || mimeType.includes('doc')) {
    return 'Word Document';
  } else if (mimeType.includes('image')) {
    return 'Image Document';
  } else {
    return 'Other Document';
  }
}

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
