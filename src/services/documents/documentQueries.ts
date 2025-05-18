
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, DocumentStatus } from '@/types/documents';
import { formatDocumentFromSupabase } from './documentFormatters';

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
