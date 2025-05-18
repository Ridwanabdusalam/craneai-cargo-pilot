
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, DocumentStatus } from '@/types/documents';
import { formatDocumentFromSupabase } from './documentFormatters';

// Get all documents with simplified query that doesn't rely on non-existent relationships
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    console.log('Fetching all documents');
    
    // First check if we're authenticated
    const { data: authData } = await supabase.auth.getSession();
    console.log('Current auth status:', authData?.session ? 'Authenticated' : 'Not authenticated');
    
    // Check if the table exists
    const { data: tableCheckData, error: tableCheckError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Error checking document table:', tableCheckError);
      console.log('The documents table may not exist or you may not have access to it');
    } else {
      console.log('Documents table exists and is accessible');
    }
    
    // Get the document count
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking document count:', countError);
    } else {
      console.log(`Document count: ${count !== null ? count : 'unknown'}`);
    }
    
    // Use a simpler query that doesn't rely on relationships that might not exist
    console.log('Fetching documents with a simplified query');
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .order('last_updated', { ascending: false });
      
    if (error) {
      console.error('Error in getAllDocuments:', error);
      return [];
    }
    
    if (!documents) {
      console.log('No documents returned (null)');
      return [];
    }
    
    if (documents.length === 0) {
      console.log('No documents found in the database (empty array)');
      return [];
    }
    
    console.log(`Successfully fetched ${documents.length} documents:`, documents);
    
    // Fetch additional data separately instead of using relationships
    const docsWithDetails = await Promise.all(
      documents.map(async (doc) => {
        // Fetch validation issues
        const { data: validationIssues } = await supabase
          .from('validation_issues')
          .select('*')
          .eq('document_id', doc.id);
          
        // Fetch document content
        const { data: contentData } = await supabase
          .from('document_content')
          .select('content, raw_text')
          .eq('document_id', doc.id)
          .maybeSingle();
          
        // Combine all data
        const enrichedDoc = {
          ...doc,
          validation_issues: validationIssues || [],
          document_content: contentData || { content: {}, raw_text: null },
          // We're not using verified_by since we don't have that relationship
          verified_by: null
        };
        
        return enrichedDoc;
      })
    );
    
    const formattedDocuments = docsWithDetails.map(doc => formatDocumentFromSupabase(doc));
    console.log('Formatted documents:', formattedDocuments);
    return formattedDocuments;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return []; // Return empty array to prevent UI issues
  }
};

// Get documents by status with the same fix applied
export const getDocumentsByStatus = async (status: DocumentStatus): Promise<Document[]> => {
  try {
    console.log(`Fetching documents with status: ${status}`);
    
    // First check if we're authenticated
    const { data: authData } = await supabase.auth.getSession();
    console.log('Current auth status:', authData?.session ? 'Authenticated' : 'Not authenticated');
    
    // Get the document count
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
    if (countError) {
      console.error(`Error checking ${status} document count:`, countError);
    } else {
      console.log(`${status} document count: ${count !== null ? count : 'unknown'}`);
    }
    
    // Use a simpler query that doesn't rely on relationships that might not exist
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('status', status)
      .order('last_updated', { ascending: false });
      
    if (error) {
      console.error(`Error in getDocumentsByStatus(${status}):`, error);
      return [];
    }
    
    if (!documents) {
      console.log(`No ${status} documents returned (null)`);
      return [];
    }
    
    if (documents.length === 0) {
      console.log(`No ${status} documents found in the database (empty array)`);
      return [];
    }
    
    // Fetch additional data separately instead of using relationships
    const docsWithDetails = await Promise.all(
      documents.map(async (doc) => {
        // Fetch validation issues
        const { data: validationIssues } = await supabase
          .from('validation_issues')
          .select('*')
          .eq('document_id', doc.id);
          
        // Fetch document content
        const { data: contentData } = await supabase
          .from('document_content')
          .select('content, raw_text')
          .eq('document_id', doc.id)
          .maybeSingle();
          
        // Combine all data
        const enrichedDoc = {
          ...doc,
          validation_issues: validationIssues || [],
          document_content: contentData || { content: {}, raw_text: null },
          verified_by: null
        };
        
        return enrichedDoc;
      })
    );
    
    const formattedDocuments = docsWithDetails.map(doc => formatDocumentFromSupabase(doc));
    return formattedDocuments;
  } catch (error) {
    console.error(`Error fetching ${status} documents:`, error);
    return [];
  }
};

// Get document by ID with the same fix applied
export const getDocumentById = async (id: string): Promise<Document | null> => {
  try {
    console.log(`Fetching document with ID: ${id}`);
    
    // Query for the main document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error('Error in getDocumentById:', error);
      toast.error('Failed to load document details');
      return null;
    }
    
    if (!document) {
      console.log(`Document with ID ${id} not found`);
      return null;
    }
    
    // Fetch validation issues
    const { data: validationIssues } = await supabase
      .from('validation_issues')
      .select('*')
      .eq('document_id', id);
    
    // Fetch document content
    const { data: contentData } = await supabase
      .from('document_content')
      .select('content, raw_text')
      .eq('document_id', id)
      .maybeSingle();
      
    // Combine all data
    const enrichedDoc = {
      ...document,
      validation_issues: validationIssues || [],
      document_content: contentData || { content: {}, raw_text: null },
      verified_by: null
    };
    
    return formatDocumentFromSupabase(enrichedDoc);
  } catch (error) {
    console.error('Error fetching document details:', error);
    toast.error('Failed to load document details');
    return null;
  }
};

// Search documents with the same fix applied
export const searchDocuments = async (query: string): Promise<Document[]> => {
  if (!query) return getAllDocuments();
  
  try {
    console.log(`Searching documents with query: ${query}`);
    
    // Use a simpler query that doesn't rely on relationships that might not exist
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.%${query}%,type.ilike.%${query}%`)
      .order('last_updated', { ascending: false });
      
    if (error) {
      console.error('Error in searchDocuments:', error);
      toast.error('Search failed');
      return [];
    }
    
    if (!documents || documents.length === 0) {
      console.log('No matching documents found');
      return [];
    }
    
    // Fetch additional data separately instead of using relationships
    const docsWithDetails = await Promise.all(
      documents.map(async (doc) => {
        // Fetch validation issues
        const { data: validationIssues } = await supabase
          .from('validation_issues')
          .select('*')
          .eq('document_id', doc.id);
          
        // Fetch document content
        const { data: contentData } = await supabase
          .from('document_content')
          .select('content, raw_text')
          .eq('document_id', doc.id)
          .maybeSingle();
          
        // Combine all data
        const enrichedDoc = {
          ...doc,
          validation_issues: validationIssues || [],
          document_content: contentData || { content: {}, raw_text: null },
          verified_by: null
        };
        
        return enrichedDoc;
      })
    );
    
    const formattedDocuments = docsWithDetails.map(doc => formatDocumentFromSupabase(doc));
    return formattedDocuments;
  } catch (error) {
    console.error('Error searching documents:', error);
    toast.error('Search failed');
    return [];
  }
};

// Create sample documents for testing with more robust implementation
export const createSampleDocuments = async (): Promise<void> => {
  try {
    console.log('Creating sample documents for testing');
    
    // First check if we're authenticated
    const { data: authData } = await supabase.auth.getSession();
    console.log('Current auth status:', authData?.session ? 'Authenticated' : 'Not authenticated');
    
    // Sample document types
    const documentTypes = [
      'Commercial Invoice',
      'Bill of Lading', 
      'Packing List', 
      'Certificate of Origin',
      'Dangerous Goods Declaration',
      'Import/Export License',
      'Insurance Certificate'
    ];
    
    // Create multiple documents for each type for better testing
    let sampleDocuments = [];
    
    for (const docType of documentTypes) {
      // Create 3 documents of each type
      for (let i = 0; i < 3; i++) {
        // Distribute statuses
        let status: DocumentStatus;
        const rand = Math.random();
        if (rand < 0.4) {
          status = 'pending';
        } else if (rand < 0.7) {
          status = 'processing';
        } else if (rand < 0.9) {
          status = 'verified';
        } else {
          status = 'rejected';
        }
        
        // Determine progress based on status
        let progress = 0;
        let flagged = false;
        
        switch (status) {
          case 'pending':
            progress = Math.floor(Math.random() * 20);
            break;
          case 'processing':
            progress = 20 + Math.floor(Math.random() * 60);
            break;
          case 'verified':
            progress = 100;
            break;
          case 'rejected':
            progress = 100;
            flagged = Math.random() > 0.5; // 50% chance of being flagged
            break;
        }
        
        // Create a unique title with timestamp to avoid duplicates
        const uniqueId = Date.now() + sampleDocuments.length;
        
        // Create document record
        sampleDocuments.push({
          title: `Sample ${docType} #${Math.floor(Math.random() * 1000)}-${uniqueId}`,
          type: docType,
          status: status,
          progress: progress,
          flagged: flagged,
          storage_path: `sample_${uniqueId}.pdf`,
          last_updated: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() // Random date in the last week
        });
      }
    }
    
    console.log(`Created ${sampleDocuments.length} sample document objects, attempting to insert into database:`, sampleDocuments);
    
    // Insert the sample documents in batch
    const { data, error } = await supabase
      .from('documents')
      .insert(sampleDocuments)
      .select();
      
    if (error) {
      console.error('Error creating sample documents:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No document records were inserted or no data returned');
      return;
    }
    
    console.log(`Successfully inserted ${data.length} sample documents:`, data);
    
    // Create document content for each sample document
    const contentPromises = data.map(doc => {
      const sampleContent: Record<string, any> = {};
      
      // Add different fields based on document type
      if (doc.type === 'Commercial Invoice') {
        sampleContent.invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`;
        sampleContent.seller = 'Sample Exporter Inc.';
        sampleContent.buyer = 'Sample Importer Ltd.';
        sampleContent.amount = (Math.random() * 10000).toFixed(2);
        sampleContent.currency = 'USD';
        sampleContent.date = new Date().toISOString().split('T')[0];
      } else if (doc.type === 'Bill of Lading') {
        sampleContent.blNumber = `BL-${Math.floor(Math.random() * 10000)}`;
        sampleContent.carrier = 'Ocean Shipping Co.';
        sampleContent.vessel = `MV Sample ${Math.floor(Math.random() * 100)}`;
        sampleContent.portOfLoading = 'Shanghai';
        sampleContent.portOfDischarge = 'Los Angeles';
      } else if (doc.type === 'Packing List') {
        sampleContent.reference = `PL-${Math.floor(Math.random() * 10000)}`;
        sampleContent.packages = Math.floor(Math.random() * 100);
        sampleContent.grossWeight = (Math.random() * 1000).toFixed(2);
        sampleContent.measurement = (Math.random() * 100).toFixed(2);
      } else {
        sampleContent.referenceNumber = `REF-${Math.floor(Math.random() * 10000)}`;
        sampleContent.issueDate = new Date().toISOString().split('T')[0];
        sampleContent.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      return supabase
        .from('document_content')
        .insert({
          document_id: doc.id,
          content: sampleContent,
          raw_text: `Sample text content for ${doc.type}`
        });
    });
    
    try {
      const contentResults = await Promise.all(contentPromises);
      console.log('Document content insertion results:', contentResults);
      const errors = contentResults.filter(result => result.error).map(result => result.error);
      if (errors.length > 0) {
        console.error(`There were ${errors.length} errors creating document content:`, errors);
      } else {
        console.log('All document content created successfully');
      }
    } catch (contentError) {
      console.error('Error creating document content:', contentError);
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error in createSampleDocuments:', error);
    return Promise.reject(error);
  }
};
