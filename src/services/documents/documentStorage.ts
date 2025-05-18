
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Download document
export const downloadDocument = async (id: string): Promise<string | null> => {
  try {
    // Get the document to find its storage path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single();
      
    if (docError || !document?.storage_path) {
      throw docError || new Error('Document file not found');
    }
    
    // Generate a download URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 60); // 60 seconds expiry
      
    if (urlError) {
      throw urlError;
    }
    
    return urlData.signedUrl;
  } catch (error) {
    console.error('Error generating document download link:', error);
    toast.error('Failed to download document');
    return null;
  }
};
