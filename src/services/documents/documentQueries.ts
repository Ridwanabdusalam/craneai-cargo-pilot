import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Document, DocumentStatus } from '@/types/documents';
import { formatDocumentFromSupabase } from './documentFormatters';

// Get all documents with enhanced error handling and logging
export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    console.log('Fetching all documents');
    
    // Check if the table exists or has been created by querying it directly
    const { data: tableCheck, error: tableError } = await supabase
      .from('documents')
      .select('count')
      .limit(1);
      
    if (tableError) {
      console.error('Error checking documents table:', tableError);
      return [];
    }
    
    console.log('Documents table check:', tableCheck);
    
    // Get all documents with full relations
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
      return [];
    }
    
    if (!documents || documents.length === 0) {
      console.log('No documents found in the database');
      return [];
    }
    
    console.log(`Successfully fetched ${documents.length} documents:`, documents);
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return []; // Return empty array to prevent UI issues
  }
};

// Get documents by status with enhanced error handling and logging
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
      return [];
    }
    
    if (!documents || documents.length === 0) {
      console.log(`No ${status} documents found`);
      return [];
    }
    
    console.log(`Found ${documents.length} ${status} documents:`, documents);
    return documents.map(doc => formatDocumentFromSupabase(doc));
  } catch (error) {
    console.error(`Error fetching ${status} documents:`, error);
    return [];
  }
};

// Get document by ID with enhanced error handling and logging
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
    
    console.log(`Found document: ${document.title}`, document);
    return formatDocumentFromSupabase(document);
  } catch (error) {
    console.error('Error fetching document details:', error);
    toast.error('Failed to load document details');
    return null;
  }
};

// Search documents with enhanced error handling and logging
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
      toast.error('Search failed');
      return [];
    }
    
    if (!documents || documents.length === 0) {
      console.log('No matching documents found');
      return [];
    }
    
    console.log(`Found ${documents.length} matching documents:`, documents);
    return documents.map(doc => formatDocumentFromSupabase(doc));
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
    
    // Sample document statuses with weighted distribution
    const statuses: DocumentStatus[] = [
      'pending', 'pending', 'pending',  // 30% pending
      'processing', 'processing',       // 20% processing
      'verified', 'verified', 'verified', // 30% verified
      'rejected', 'rejected'            // 20% rejected
    ];
    
    // Create a batch of sample documents
    const sampleDocuments = [];
    
    for (let i = 0; i < documentTypes.length; i++) {
      // Select a random status with the weighted distribution
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Determine progress based on status
      let progress = 0;
      let flagged = false;
      
      switch (randomStatus) {
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
      const uniqueId = Date.now() + i;
      
      // Create document record
      const documentData = {
        title: `Sample ${documentTypes[i]} #${Math.floor(Math.random() * 1000)}-${uniqueId}`,
        type: documentTypes[i],
        status: randomStatus,
        progress: progress,
        flagged: flagged,
        storage_path: `sample_${i}_${uniqueId}.pdf`,
        last_updated: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() // Random date in the last week
      };
      
      sampleDocuments.push(documentData);
    }
    
    console.log('Attempting to insert sample documents:', sampleDocuments);
    
    // Insert the sample documents in batch
    const { data, error } = await supabase
      .from('documents')
      .insert(sampleDocuments)
      .select();
      
    if (error) {
      console.error('Error creating sample documents:', error);
      throw error;
    }
    
    console.log(`Successfully created ${data ? data.length : 0} sample documents:`, data);
    
    // Create document content for each sample document
    if (data && data.length > 0) {
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
        await Promise.all(contentPromises);
        console.log('Created sample document content for all documents');
      } catch (contentError) {
        console.error('Error creating document content:', contentError);
      }
    } else {
      console.warn('No document data returned after insertion');
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error in createSampleDocuments:', error);
    return Promise.reject(error);
  }
};
