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
      console.log('Raw contentData from database:', contentData[0]);
      
      // First, try to use the content field directly if it exists and is an object
      if (contentData[0].content && typeof contentData[0].content === 'object') {
        contentObject = contentData[0].content;
        console.log('Using content object directly:', contentObject);
      } 
      // If content is a string, try to parse it as JSON
      else if (contentData[0].content && typeof contentData[0].content === 'string') {
        try {
          contentObject = JSON.parse(contentData[0].content);
          console.log('Parsed content from string:', contentObject);
        } catch (e) {
          console.error('Error parsing content string:', e);
          contentObject = { error: 'Failed to parse content' };
        }
      }
      // If we have raw_text but no content, try to parse that
      else if (contentData[0].raw_text) {
        try {
          const parsed = JSON.parse(contentData[0].raw_text);
          contentObject = parsed;
          console.log('Parsed content from raw_text:', contentObject);
        } catch (e) {
          console.error('Error parsing raw_text:', e);
          contentObject = { raw_text: contentData[0].raw_text };
        }
      }
    }

    console.log('Final content object before formatting:', contentObject);
    
    // Format document with available data
    const formattedDocument = formatDocumentFromSupabase({
      ...documentData,
      document_content: [
        {
          content: contentObject,
          created_at: new Date().toISOString(),
          document_id: id,
          id: 'temp-id',
          raw_text: contentData?.[0]?.raw_text || ''
        }
      ],
      validation_issues: validationIssues || [],
      validation_checks: []
    });
    
    console.log('Formatted document with content:', {
      hasContent: !!formattedDocument.content,
      contentKeys: formattedDocument.content ? Object.keys(formattedDocument.content) : []
    });
    
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
