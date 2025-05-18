
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, DocumentStatus } from '@/types/documents';
import { formatDocumentFromSupabase } from './documentFormatters';

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    console.log('Fetching all documents');
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
      console.error('Error in getAllDocuments:', error);
      throw error;
    }
    
    if (!documents) {
      console.log('No documents found');
      return [];
    }
    
    console.log(`Found ${documents.length} documents`, documents);
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Get documents by status
export const getDocumentsByStatus = async (status: DocumentStatus): Promise<Document[]> => {
  try {
    console.log(`Fetching documents with status: ${status}`);
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
      console.error(`Error in getDocumentsByStatus(${status}):`, error);
      throw error;
    }
    
    if (!documents) {
      console.log(`No ${status} documents found`);
      return [];
    }
    
    console.log(`Found ${documents.length} ${status} documents`);
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error(`Error fetching ${status} documents:`, error);
    return [];
  }
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document | null> => {
  try {
    console.log(`Fetching document with ID: ${id}`);
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
      if (error.code === 'PGRST116') {
        console.log(`Document with ID ${id} not found`);
        return null;
      }
      console.error('Error in getDocumentById:', error);
      throw error;
    }
    
    console.log(`Found document: ${document.title}`);
    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Error fetching document details:', error);
    return null;
  }
};

// Search documents
export const searchDocuments = async (query: string): Promise<Document[]> => {
  if (!query) return getAllDocuments();
  
  try {
    console.log(`Searching documents with query: ${query}`);
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
      console.error('Error in searchDocuments:', error);
      throw error;
    }
    
    if (!documents) {
      console.log('No matching documents found');
      return [];
    }
    
    console.log(`Found ${documents.length} matching documents`);
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
};
