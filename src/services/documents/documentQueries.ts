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

// Get document by ID with enhanced content extraction
export const getDocumentById = async (id: string): Promise<Document> => {
  try {
    console.log(`Fetching document with ID: ${id}`);
    
    // First, get the document metadata
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (documentError) {
      console.error('Error fetching document metadata:', documentError);
      throw documentError;
    }
    
    console.log('Document metadata fetched:', documentData);

    // Get validation issues for this document
    const { data: validationIssues, error: issuesError } = await supabase
      .from('validation_issues')
      .select('*')
      .eq('document_id', id);

    if (issuesError) {
      console.error('Error fetching validation issues:', issuesError);
    }
    
    console.log('Validation issues fetched:', validationIssues?.length || 0);

    // Get document content with improved extraction
    const { data: contentData, error: contentError } = await supabase
      .from('document_content')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: false }) // Get the most recent record first
      .limit(1); // Only get the most recent record

    if (contentError) {
      console.error('Error fetching document content:', contentError);
    } else {
      console.log('Document content fetched:', contentData && contentData.length > 0 ? 'Content available' : 'No content');
      if (contentData && contentData.length > 0) {
        console.log('Content keys:', Object.keys(contentData[0]));
        
        // Log more detailed information about the content structure
        if (contentData[0].content) {
          console.log('Content type:', typeof contentData[0].content);
          if (typeof contentData[0].content === 'object') {
            console.log('Content keys:', Object.keys(contentData[0].content));
          } else {
            console.log('Content is not an object, might need parsing');
          }
        }
        
        // Log raw text info
        if (contentData[0].raw_text) {
          console.log('Raw text length:', contentData[0].raw_text.length);
          console.log('Raw text preview:', contentData[0].raw_text.substring(0, 100));
        }
      }
    }

    // Enhanced content extraction with better error handling
    let contentObject = {};
    
    if (contentData && contentData.length > 0) {
      // Try to extract content from the content field first
      if (contentData[0].content) {
        try {
          if (typeof contentData[0].content === 'string') {
            // If it's a string, try to parse it
            contentObject = JSON.parse(contentData[0].content);
            console.log('Parsed content from string');
          } else if (typeof contentData[0].content === 'object') {
            // If it's already an object, use it directly
            contentObject = contentData[0].content;
            console.log('Using content object directly');
          }
        } catch (e) {
          console.error('Error handling content:', e);
          contentObject = { error: 'Failed to process content data' };
        }
      }
      
      // If we don't have content object but have raw_text, try to use that
      if (Object.keys(contentObject).length === 0 && contentData[0].raw_text) {
        try {
          const parsed = JSON.parse(contentData[0].raw_text);
          contentObject = parsed;
          console.log('Extracted content from raw_text');
        } catch (e) {
          console.error('Error parsing raw_text:', e);
          contentObject = { raw_text: contentData[0].raw_text };
        }
      }
    }

    console.log('Final content object:', contentObject);
    
    // Format document with available data
    const formattedDocument = formatDocumentFromSupabase({
      ...documentData,
      content: contentObject,
      validationIssues: validationIssues || [],
      validationChecks: [] // Use empty array since validation_checks table doesn't exist
    });
    
    console.log('Document formatted and ready to return');
    
    return formattedDocument;
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
