
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentStatus } from '@/types/documents';
import { formatDocumentFromSupabase } from './documentFormatters';

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(formatDocumentFromSupabase);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    throw error;
  }
};

// Get documents by status
export const getDocumentsByStatus = async (status: DocumentStatus): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('status', status)
      .order('last_updated', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(formatDocumentFromSupabase);
  } catch (error) {
    console.error(`Error fetching documents with status ${status}:`, error);
    throw error;
  }
};

// Get document by ID with enhanced content selection logic
export const getDocumentById = async (id: string): Promise<Document> => {
  try {
    // First, get the document metadata
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (documentError) {
      throw documentError;
    }

    // Get validation issues for this document
    const { data: validationIssues, error: issuesError } = await supabase
      .from('validation_issues')
      .select('*')
      .eq('document_id', id);

    if (issuesError) {
      console.error('Error fetching validation issues:', issuesError);
    }

    // Get document content with improved selection logic 
    const { data: contentData, error: contentError } = await supabase
      .from('document_content')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: false }) // Get the most recent record first
      .limit(1); // Only get the most recent record

    if (contentError) {
      console.error('Error fetching document content:', contentError);
    }

    const content = contentData && contentData.length > 0 
      ? contentData[0].content 
      : {};

    const rawText = contentData && contentData.length > 0 && contentData[0].raw_text
      ? contentData[0].raw_text
      : '';

    // Format document with available data
    return formatDocumentFromSupabase({
      ...documentData,
      content: {
        ...content,
        raw_text: rawText
      },
      validationIssues: validationIssues || [],
      validationChecks: [] // Use empty array since validation_checks table doesn't exist
    });
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    throw error;
  }
};

// Search documents by title or type
export const searchDocuments = async (query: string): Promise<Document[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('last_updated', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(formatDocumentFromSupabase);
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

// Create sample documents (for development/testing)
export const createSampleDocuments = async (): Promise<void> => {
  try {
    const sampleDocuments = [
      {
        title: 'Sample Invoice 001',
        type: 'Invoice',
        status: 'pending',
        progress: 10,
        flagged: false,
        storage_path: '/path/to/invoice001.pdf',
        last_updated: new Date().toISOString()
      },
      {
        title: 'Sample Bill of Lading 002',
        type: 'Bill of Lading',
        status: 'processing',
        progress: 50,
        flagged: false,
        storage_path: '/path/to/bol002.pdf',
        last_updated: new Date().toISOString()
      },
      {
        title: 'Sample Customs Declaration 003',
        type: 'Customs Declaration',
        status: 'verified',
        progress: 100,
        flagged: false,
        storage_path: '/path/to/customs003.pdf',
        last_updated: new Date().toISOString()
      },
      {
        title: 'Sample Commercial Invoice 004',
        type: 'Commercial Invoice',
        status: 'rejected',
        progress: 100,
        flagged: true,
        storage_path: '/path/to/invoice004.pdf',
        last_updated: new Date().toISOString()
      }
    ];

    // Insert the sample documents into the database
    const { error } = await supabase
      .from('documents')
      .insert(sampleDocuments);

    if (error) {
      throw error;
    }

    console.log('Sample documents created successfully');
  } catch (error) {
    console.error('Error creating sample documents:', error);
    throw error;
  }
};
