
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Query the Model Context Protocol with logistics context
export const queryWithContext = async (query: string, contextTypes: string[] = []): Promise<string> => {
  try {
    // Show loading indicator for longer queries
    let toastId;
    
    if (query.length > 20) {
      toastId = toast.loading('Getting AI response...');
    }
    
    console.log('Querying MCP with:', {query, contextTypes, useVectorSearch: true});
    
    const { data, error } = await supabase.functions.invoke('model-context-protocol', {
      body: { 
        query, 
        contextTypes: contextTypes.length > 0 ? contextTypes : undefined,
        useVectorSearch: true // Enable vector search for better context retrieval
      }
    });
    
    if (toastId) {
      toast.dismiss(toastId);
    }
    
    if (error) {
      console.error('Error calling Model Context Protocol:', error);
      throw error;
    }
    
    if (!data || !data.response) {
      console.error('No response data received from AI:', data);
      throw new Error('No response data received from AI');
    }
    
    console.log('AI response received');
    return data.response;
  } catch (error) {
    console.error('Error calling Model Context Protocol:', error);
    toast.error('Failed to get AI response');
    return 'I encountered an error while processing your request. Please try again.';
  }
};

// Seed the knowledge base with logistics domain knowledge and website content
export const seedKnowledgeBase = async (): Promise<boolean> => {
  try {
    const toastId = toast.loading('Seeding knowledge base...');
    
    console.log('Starting knowledge base seeding');
    
    const { data, error } = await supabase.functions.invoke('seed-knowledge-base', {
      body: {
        includeWebsiteContent: true, // Include crawled website content
        forceRefresh: true // Force refresh the knowledge base
      }
    });
    
    toast.dismiss(toastId);
    
    if (error) {
      console.error('Error seeding knowledge base:', error);
      toast.error('Failed to seed knowledge base');
      throw error;
    }
    
    toast.success('Knowledge base updated successfully');
    console.log('Knowledge base seeding result:', data);
    return true;
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    toast.error('Failed to seed knowledge base');
    return false;
  }
};

// Get all context source types (for filtering)
export const getContextSourceTypes = async (): Promise<string[]> => {
  try {
    console.log('Fetching context source types');
    
    // Use a different approach to get distinct values
    const { data, error } = await supabase
      .from('context_sources')
      .select('source_type');
      
    if (error) {
      console.error('Error fetching context source types:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No context source types found, returning defaults');
      return ['company_info', 'services', 'industry', 'technology', 'compliance', 'website_content'];
    }
    
    // Manually get unique source types from the results
    const uniqueTypes = new Set<string>();
    data.forEach(row => {
      if (row.source_type) {
        uniqueTypes.add(row.source_type);
      }
    });
    
    const typeArray = Array.from(uniqueTypes);
    console.log('Context source types:', typeArray);
    
    return typeArray.length > 0 
      ? typeArray 
      : ['company_info', 'services', 'industry', 'technology', 'compliance', 'website_content'];
  } catch (error) {
    console.error('Error fetching context source types:', error);
    return ['company_info', 'services', 'industry', 'technology', 'compliance', 'website_content'];
  }
};
