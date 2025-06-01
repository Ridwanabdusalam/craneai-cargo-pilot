
import { supabase } from '@/integrations/supabase/client';
import { formatDocumentFromSupabase } from './documentFormatters';
import { Document, DocumentFilters } from '@/types/documents';

// Get all documents
export async function getAllDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return (data || []).map(formatDocumentFromSupabase);
}

// Get documents by status
export async function getDocumentsByStatus(status: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
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
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents by status:', error);
    throw error;
  }

  return (data || []).map(formatDocumentFromSupabase);
}

// Get document by ID with enhanced content extraction
export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
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
      ),
      document_content(
        content,
        raw_text
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data ? formatDocumentFromSupabase(data) : null;
}

// Search documents by title or type
export async function searchDocuments(query: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
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
    .or(`title.ilike.%${query}%,type.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching documents:', error);
    throw error;
  }

  return (data || []).map(formatDocumentFromSupabase);
}

// Create sample documents (for development/testing)
export async function createSampleDocuments(): Promise<void> {
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
}
